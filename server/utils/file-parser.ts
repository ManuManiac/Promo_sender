import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedRecipient {
  email: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, any>;
}

export interface ParseResult {
  recipients: ParsedRecipient[];
  columnHeaders: string[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
}

// Parse CSV file
export function parseCSV(fileContent: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const columnHeaders = results.meta.fields || [];
        const totalRows = results.data.length;
        const mappedRecipients = mapRowsToRecipients(results.data as any[], columnHeaders);
        
        // Deduplicate by email
        const { recipients, duplicateCount } = deduplicateRecipients(mappedRecipients);
        
        resolve({
          recipients,
          columnHeaders,
          totalRows,
          validCount: recipients.length,
          invalidCount: totalRows - mappedRecipients.length,
          duplicateCount,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

// Parse XLSX file
export function parseXLSX(buffer: Buffer): ParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (jsonData.length < 2) {
      throw new Error("File must contain at least a header row and one data row");
    }

    // First row is headers
    const columnHeaders = jsonData[0].map(String);
    const dataRows = jsonData.slice(1);
    const totalRows = dataRows.length;
    
    // Convert array format to object format
    const objects = dataRows.map(row => {
      const obj: Record<string, any> = {};
      columnHeaders.forEach((header, index) => {
        if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
          obj[header] = row[index];
        }
      });
      return obj;
    });

    const mappedRecipients = mapRowsToRecipients(objects, columnHeaders);
    
    // Deduplicate by email
    const { recipients, duplicateCount } = deduplicateRecipients(mappedRecipients);
    
    return {
      recipients,
      columnHeaders,
      totalRows,
      validCount: recipients.length,
      invalidCount: totalRows - mappedRecipients.length,
      duplicateCount,
    };
  } catch (error: any) {
    throw new Error(`XLSX parsing error: ${error.message}`);
  }
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Map rows to recipients with intelligent column detection
function mapRowsToRecipients(rows: any[], headers: string[]): ParsedRecipient[] {
  // Try to detect email, firstName, lastName columns
  const emailCol = detectColumn(headers, ['email', 'e-mail', 'mail', 'email address']);
  const firstNameCol = detectColumn(headers, ['first name', 'firstname', 'fname', 'given name']);
  const lastNameCol = detectColumn(headers, ['last name', 'lastname', 'lname', 'surname', 'family name']);

  return rows.map(row => {
    const emailValue = emailCol ? String(row[emailCol]).trim() : '';
    
    const recipient: ParsedRecipient = {
      email: emailValue,
    };

    if (firstNameCol && row[firstNameCol]) {
      recipient.firstName = String(row[firstNameCol]).trim();
    }

    if (lastNameCol && row[lastNameCol]) {
      recipient.lastName = String(row[lastNameCol]).trim();
    }

    // Store all other columns in metadata
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
  }).filter(r => r.email && isValidEmail(r.email)); // Filter invalid emails
}

// Deduplicate recipients by email (case-insensitive)
function deduplicateRecipients(recipients: ParsedRecipient[]): { recipients: ParsedRecipient[]; duplicateCount: number } {
  const seen = new Set<string>();
  const unique: ParsedRecipient[] = [];
  let duplicateCount = 0;

  for (const recipient of recipients) {
    const normalizedEmail = recipient.email.toLowerCase();
    if (!seen.has(normalizedEmail)) {
      seen.add(normalizedEmail);
      unique.push(recipient);
    } else {
      duplicateCount++;
    }
  }

  return { recipients: unique, duplicateCount };
}

// Detect column name case-insensitively
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
