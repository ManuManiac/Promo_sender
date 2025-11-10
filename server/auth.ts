import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, passkeys, type User } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";

// Passport serialization
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Local strategy for email/password
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase()),
        });

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        if (!user.password) {
          return done(null, false, { message: "Please use passkey to login" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// WebAuthn configuration
const rpName = "Promo Hub";
const rpID = process.env.REPLIT_DEV_DOMAIN?.split(":")[0] || "localhost";
const origin = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : "http://localhost:5000";

// Generate registration options for new passkey
export async function generatePasskeyRegistrationOptions(userId: string, userName: string, userEmail: string) {
  const userPasskeys = await db.query.passkeys.findMany({
    where: eq(passkeys.userId, userId),
  });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: userEmail,
    userDisplayName: userName,
    attestationType: "none",
    excludeCredentials: userPasskeys.map((passkey) => ({
      id: passkey.id,
      transports: passkey.transports?.split(",") as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  return options;
}

// Verify passkey registration
export async function verifyPasskeyRegistration(
  userId: string,
  response: RegistrationResponseJSON,
  expectedChallenge: string
) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Passkey registration verification failed");
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  // Store the passkey
  await db.insert(passkeys).values({
    id: credential.id,
    userId,
    credentialPublicKey: Buffer.from(credential.publicKey).toString("base64"),
    counter: credential.counter,
    credentialDeviceType,
    credentialBackedUp,
    transports: response.response.transports?.join(","),
  });

  return verification;
}

// Generate authentication options for passkey login
export async function generatePasskeyAuthenticationOptions(email?: string) {
  let userPasskeys: typeof passkeys.$inferSelect[] = [];

  if (email) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (user) {
      userPasskeys = await db.query.passkeys.findMany({
        where: eq(passkeys.userId, user.id),
      });
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: userPasskeys.length > 0 
      ? userPasskeys.map((passkey) => ({
          id: passkey.id,
          transports: passkey.transports?.split(",") as AuthenticatorTransportFuture[],
        }))
      : [],
    userVerification: "preferred",
  });

  return options;
}

// Verify passkey authentication
export async function verifyPasskeyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string
) {
  const passkey = await db.query.passkeys.findFirst({
    where: eq(passkeys.id, response.id),
  });

  if (!passkey) {
    throw new Error("Passkey not found");
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.id,
      publicKey: Buffer.from(passkey.credentialPublicKey, "base64"),
      counter: passkey.counter,
    },
  });

  if (!verification.verified) {
    throw new Error("Passkey authentication verification failed");
  }

  // Update counter
  await db.update(passkeys)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(passkeys.id, response.id));

  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.id, passkey.userId),
  });

  return { verified: true, user };
}

export default passport;
