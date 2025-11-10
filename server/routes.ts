import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, type User, insertUserSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import passport from "./auth";
import {
  generatePasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  generatePasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
} from "./auth";
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/types";
import { parseCSV, parseXLSX } from "./utils/file-parser";
import { extractSpreadsheetId, fetchGoogleSheetData } from "./utils/google-sheets";

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Store challenges temporarily (in production, use Redis or database)
const challenges = new Map<string, string>();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ===== Authentication Routes =====
  
  // Register new user (email/password)
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, userData.email.toLowerCase()),
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password if provided
      let hashedPassword: string | null = null;
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 10);
      }

      // Create user
      const [newUser] = await db.insert(users).values({
        email: userData.email.toLowerCase(),
        name: userData.name,
        password: hashedPassword,
      }).returning();

      // Log in the user
      req.login(newUser, (err) => {
        if (err) return next(err);
        res.json({ 
          user: { 
            id: newUser.id, 
            email: newUser.email, 
            name: newUser.name 
          } 
        });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Login with email/password
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name 
          } 
        });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user as User;
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        } 
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // ===== WebAuthn/Passkey Routes =====

  // Generate passkey registration options
  app.post("/api/auth/passkey/register/options", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const options = await generatePasskeyRegistrationOptions(
        user.id,
        user.name,
        user.email
      );
      
      // Store challenge
      challenges.set(user.id, options.challenge);
      
      res.json(options);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify passkey registration
  app.post("/api/auth/passkey/register/verify", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const response: RegistrationResponseJSON = req.body;
      
      const expectedChallenge = challenges.get(user.id);
      if (!expectedChallenge) {
        return res.status(400).json({ message: "Challenge not found" });
      }

      const verification = await verifyPasskeyRegistration(
        user.id,
        response,
        expectedChallenge
      );

      challenges.delete(user.id);

      if (verification.verified) {
        res.json({ verified: true });
      } else {
        res.status(400).json({ message: "Verification failed" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate passkey authentication options
  app.post("/api/auth/passkey/login/options", async (req, res) => {
    try {
      const { email } = req.body;
      const options = await generatePasskeyAuthenticationOptions(email);
      
      // Store challenge with a temporary ID
      const challengeId = `login-${Date.now()}-${Math.random()}`;
      challenges.set(challengeId, options.challenge);
      
      res.json({ ...options, challengeId });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify passkey authentication
  app.post("/api/auth/passkey/login/verify", async (req, res, next) => {
    try {
      const { response, challengeId }: { response: AuthenticationResponseJSON; challengeId: string } = req.body;
      
      const expectedChallenge = challenges.get(challengeId);
      if (!expectedChallenge) {
        return res.status(400).json({ message: "Challenge not found" });
      }

      const verification = await verifyPasskeyAuthentication(
        response,
        expectedChallenge
      );

      challenges.delete(challengeId);

      if (verification.verified && verification.user) {
        req.login(verification.user, (err) => {
          if (err) return next(err);
          res.json({ 
            user: { 
              id: verification.user!.id, 
              email: verification.user!.email, 
              name: verification.user!.name 
            } 
          });
        });
      } else {
        res.status(401).json({ message: "Authentication failed" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Recipient List Routes =====

  // Get all recipient lists for current user
  app.get("/api/recipient-lists", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { recipientLists } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const lists = await db.query.recipientLists.findMany({
        where: eq(recipientLists.userId, user.id),
        with: {
          recipients: true,
        },
      });

      // Add recipient count to each list
      const listsWithCount = lists.map(list => ({
        ...list,
        count: list.recipients?.length || 0,
      }));

      res.json(listsWithCount);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new recipient list
  app.post("/api/recipient-lists", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { recipientLists, insertRecipientListSchema } = await import("@shared/schema");
      
      const listData = insertRecipientListSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const [newList] = await db.insert(recipientLists).values(listData).returning();
      res.json(newList);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete a recipient list
  app.delete("/api/recipient-lists/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { recipientLists } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");

      await db.delete(recipientLists).where(
        and(
          eq(recipientLists.id, req.params.id),
          eq(recipientLists.userId, user.id)
        )
      );

      res.json({ message: "List deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Recipient Routes =====

  // Add recipients to a list
  app.post("/api/recipient-lists/:listId/recipients", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { listId } = req.params;
      const { recipients: recipientsData } = req.body;
      
      const { recipientLists, recipients, insertRecipientSchema } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");

      // Verify list ownership
      const list = await db.query.recipientLists.findFirst({
        where: and(
          eq(recipientLists.id, listId),
          eq(recipientLists.userId, user.id)
        ),
      });

      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }

      // Get existing recipients to check for duplicates
      const existingRecipients = await db.query.recipients.findMany({
        where: eq(recipients.listId, listId),
      });

      const existingEmails = new Set(existingRecipients.map(r => r.email.toLowerCase()));

      // Validate and filter recipients
      const validRecipients = [];
      const invalidRecipients = [];
      const duplicateEmails = [];

      for (const recipient of recipientsData) {
        try {
          const validatedRecipient = insertRecipientSchema.parse({
            ...recipient,
            listId,
            email: recipient.email.toLowerCase(),
          });

          if (existingEmails.has(validatedRecipient.email)) {
            duplicateEmails.push(recipient.email);
          } else {
            validRecipients.push(validatedRecipient);
            existingEmails.add(validatedRecipient.email);
          }
        } catch (error) {
          invalidRecipients.push({ email: recipient.email, error: "Invalid email" });
        }
      }

      // Insert valid recipients
      let inserted = [];
      if (validRecipients.length > 0) {
        inserted = await db.insert(recipients).values(validRecipients).returning();
      }

      res.json({
        inserted: inserted.length,
        duplicates: duplicateEmails.length,
        invalid: invalidRecipients.length,
        details: {
          insertedRecipients: inserted,
          duplicateEmails,
          invalidRecipients,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get recipients for a list
  app.get("/api/recipient-lists/:listId/recipients", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { listId } = req.params;
      
      const { recipientLists, recipients } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");

      // Verify list ownership
      const list = await db.query.recipientLists.findFirst({
        where: and(
          eq(recipientLists.id, listId),
          eq(recipientLists.userId, user.id)
        ),
      });

      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }

      const recipientsList = await db.query.recipients.findMany({
        where: eq(recipients.listId, listId),
      });

      res.json(recipientsList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== File Import Routes =====

  // Parse CSV file
  app.post("/api/parse/csv", requireAuth, async (req, res) => {
    try {
      const { fileContent } = req.body;
      
      if (!fileContent) {
        return res.status(400).json({ message: "File content is required" });
      }

      const result = await parseCSV(fileContent);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Parse XLSX file
  app.post("/api/parse/xlsx", requireAuth, async (req, res) => {
    try {
      const { fileContent } = req.body;
      
      if (!fileContent) {
        return res.status(400).json({ message: "File content is required" });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(fileContent, 'base64');
      const result = parseXLSX(buffer);
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Import from Google Sheets
  app.post("/api/import/google-sheets", requireAuth, async (req, res) => {
    try {
      const { url, range } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "Google Sheets URL is required" });
      }

      const spreadsheetId = extractSpreadsheetId(url);
      const values = await fetchGoogleSheetData(spreadsheetId, range);

      if (values.length < 2) {
        return res.status(400).json({ message: "Sheet must contain at least a header row and one data row" });
      }

      // First row is headers
      const columnHeaders = values[0].map(String);
      const dataRows = values.slice(1);
      const totalRows = dataRows.length;

      // Convert to objects
      const objects = dataRows.map(row => {
        const obj: Record<string, any> = {};
        columnHeaders.forEach((header, index) => {
          if (row[index]) {
            obj[header] = row[index];
          }
        });
        return obj;
      });

      // Map to recipients (reuse the logic from file-parser)
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailCol = detectColumn(columnHeaders, ['email', 'e-mail', 'mail', 'email address']);
      const firstNameCol = detectColumn(columnHeaders, ['first name', 'firstname', 'fname', 'given name']);
      const lastNameCol = detectColumn(columnHeaders, ['last name', 'lastname', 'lname', 'surname', 'family name']);

      const mappedRecipients = objects.map(row => {
        const emailValue = emailCol ? String(row[emailCol]).trim() : '';
        
        const recipient: any = {
          email: emailValue,
        };

        if (firstNameCol && row[firstNameCol]) {
          recipient.firstName = String(row[firstNameCol]).trim();
        }

        if (lastNameCol && row[lastNameCol]) {
          recipient.lastName = String(row[lastNameCol]).trim();
        }

        const metadata: Record<string, any> = {};
        Object.keys(row).forEach(key => {
          if (key !== emailCol && key !== firstNameCol && key !== lastNameCol && row[key]) {
            metadata[key] = row[key];
          }
        });

        if (Object.keys(metadata).length > 0) {
          recipient.metadata = metadata;
        }

        return recipient;
      }).filter(r => r.email && EMAIL_REGEX.test(r.email));

      // Deduplicate
      const seen = new Set<string>();
      const recipients: any[] = [];
      let duplicateCount = 0;

      for (const recipient of mappedRecipients) {
        const normalizedEmail = recipient.email.toLowerCase();
        if (!seen.has(normalizedEmail)) {
          seen.add(normalizedEmail);
          recipients.push(recipient);
        } else {
          duplicateCount++;
        }
      }

      res.json({
        recipients,
        columnHeaders,
        totalRows,
        validCount: recipients.length,
        invalidCount: totalRows - mappedRecipients.length,
        duplicateCount,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function for column detection
function detectColumn(headers: string[], possibleNames: string[]): string | null {
  const lowerHeaders = headers.map(h => h.toLowerCase());
  
  for (const name of possibleNames) {
    const index = lowerHeaders.indexOf(name);
    if (index !== -1) {
      return headers[index];
    }
  }
  
  return null;
}
