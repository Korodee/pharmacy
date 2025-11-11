import { getCollection, connectToDatabase } from './mongodb';
import { google } from 'googleapis';

interface BackupData {
  collection: string;
  data: any[];
  backupDate: string;
}

/**
 * Export all collections from MongoDB
 */
export async function exportMongoCollections(): Promise<BackupData[]> {
  const db = await connectToDatabase();
  const collections = await db.listCollections().toArray();
  const backupData: BackupData[] = [];
  const backupDate = new Date().toISOString();

  for (const collectionInfo of collections) {
    const collectionName = collectionInfo.name;
    // Skip system collections
    if (collectionName.startsWith('system.')) {
      continue;
    }

    const collection = await getCollection(collectionName);
    const documents = await collection.find({}).toArray();
    
    backupData.push({
      collection: collectionName,
      data: documents,
      backupDate,
    });
  }

  return backupData;
}

/**
 * Initialize Google Sheets API client
 */
function getGoogleSheetsClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set. Please configure it in your environment variables.');
  }

  let key;
  try {
    key = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
  } catch (error) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON. Please check your environment variable.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive',
    ],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Create or get backup spreadsheet
 */
async function getOrCreateSpreadsheet(spreadsheetId: string | undefined): Promise<string> {
  const sheets = getGoogleSheetsClient();

  // Get service account email for error messages
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  let serviceAccountEmail = 'service account';
  if (credentials) {
    try {
      const key = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
      serviceAccountEmail = key.client_email || serviceAccountEmail;
    } catch {
      // Ignore parsing errors
    }
  }

  if (spreadsheetId) {
    // Try to access the spreadsheet directly via Sheets API
    // This is more reliable than using Drive API
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        fields: 'spreadsheetId,properties.title',
      });
      return spreadsheetId;
    } catch (error: any) {
      if (error.code === 404) {
        // Spreadsheet not found, will create new one below
      } else if (error.code === 403 || error.message?.includes('permission')) {
        throw new Error(
          `Permission denied. Please share the spreadsheet (ID: ${spreadsheetId}) with the service account: ${serviceAccountEmail}. ` +
          `Go to https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit and click Share, then add the email with Editor permissions. ` +
          `Note: It may take a few minutes for permissions to propagate.`
        );
      } else {
        // For other errors, still try to use the spreadsheet ID
        // It might work for writing even if reading metadata fails
        return spreadsheetId;
      }
    }
  }

  // Create new spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: `Kateri Pharmacy Backup - ${new Date().toISOString().split('T')[0]}`,
      },
    },
  });

  const newSpreadsheetId = spreadsheet.data.spreadsheetId;
  if (!newSpreadsheetId) {
    throw new Error('Failed to create spreadsheet');
  }

  return newSpreadsheetId;
}

/**
 * Upload backup data to Google Sheets
 */
export async function uploadToGoogleSheets(backupData: BackupData[]): Promise<string> {
  const spreadsheetId = process.env.GOOGLE_BACKUP_SPREADSHEET_ID;
  const sheets = getGoogleSheetsClient();
  
  const targetSpreadsheetId = await getOrCreateSpreadsheet(spreadsheetId);

  const today = new Date().toISOString().split('T')[0];

  try {
    // Organize data by category/type
    const claimsData = backupData.find(b => b.collection === 'claims');
    const requestsData = backupData.find(b => b.collection === 'requests');
    const otherCollections = backupData.filter(b => b.collection !== 'claims' && b.collection !== 'requests');

    // Delete and recreate sheets for today's backup
    const sheetNames = [
      'Medications',
      'Appeals',
      'Manual Claims',
      'Diapers and Pads',
      'Refill Requests',
      'Consultation Requests',
    ];

    // Delete existing sheets for today
    for (const sheetName of sheetNames) {
      const existingSheetId = await getSheetId(sheets, targetSpreadsheetId, sheetName);
      if (existingSheetId !== null) {
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: targetSpreadsheetId,
            requestBody: {
              requests: [{
                deleteSheet: {
                  sheetId: existingSheetId,
                },
              }],
            },
          });
        } catch (error) {
          // Continue if sheet deletion fails - will overwrite anyway
        }
      }
    }

    // Create new sheets
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: targetSpreadsheetId,
      requestBody: {
        requests: sheetNames.map(sheetName => ({
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        })),
      },
    });

    // Write claims by category
    if (claimsData && claimsData.data.length > 0) {
      const claimsByCategory = {
        'medications': claimsData.data.filter((c: any) => c.category === 'medications'),
        'appeals': claimsData.data.filter((c: any) => c.category === 'appeals'),
        'manual-claims': claimsData.data.filter((c: any) => c.category === 'manual-claims'),
        'diapers-pads': claimsData.data.filter((c: any) => c.category === 'diapers-pads'),
      };

      await writeDataToSheet(sheets, targetSpreadsheetId, 'Medications', claimsByCategory['medications']);
      await writeDataToSheet(sheets, targetSpreadsheetId, 'Appeals', claimsByCategory['appeals']);
      await writeDataToSheet(sheets, targetSpreadsheetId, 'Manual Claims', claimsByCategory['manual-claims']);
      await writeDataToSheet(sheets, targetSpreadsheetId, 'Diapers and Pads', claimsByCategory['diapers-pads']);
    }

    // Write requests by type
    if (requestsData && requestsData.data.length > 0) {
      const refillRequests = requestsData.data.filter((r: any) => r.type === 'refill');
      const consultationRequests = requestsData.data.filter((r: any) => r.type === 'consultation');

      await writeDataToSheet(sheets, targetSpreadsheetId, 'Refill Requests', refillRequests);
      await writeDataToSheet(sheets, targetSpreadsheetId, 'Consultation Requests', consultationRequests);
    }

    // Write other collections to a separate sheet if they exist
    if (otherCollections.length > 0) {
      const otherSheetName = `Other Collections_${today}`;
      const existingSheetId = await getSheetId(sheets, targetSpreadsheetId, otherSheetName);
      if (existingSheetId !== null) {
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: targetSpreadsheetId,
            requestBody: {
              requests: [{
                deleteSheet: { sheetId: existingSheetId },
              }],
            },
          });
        } catch (error) {
          // Continue if sheet deletion fails - will overwrite anyway
        }
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: targetSpreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: otherSheetName,
              },
            },
          }],
        },
      });

      for (const backup of otherCollections) {
        await writeCollectionToSheet(sheets, targetSpreadsheetId, otherSheetName, backup);
      }
    }

    // Create summary sheet
    await createSummarySheet(sheets, targetSpreadsheetId, backupData, today);

    return targetSpreadsheetId;
  } catch (error) {
    throw error;
  }
}

/**
 * Get sheet ID by name
 */
async function getSheetId(sheets: any, spreadsheetId: string, sheetName: string): Promise<number | null> {
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);
    return sheet?.properties?.sheetId || null;
  } catch {
    return null;
  }
}

/**
 * Format value for Excel compatibility
 */
function formatValueForExcel(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle Date objects
  if (value instanceof Date) {
    return value.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
  
  // Handle arrays - format as readable list
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '';
    }
    // If array of objects, format each object
    if (value.length > 0 && typeof value[0] === 'object') {
      return value.map((item: any) => {
        if (typeof item === 'object') {
          // Format object as key:value pairs
          return Object.entries(item)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');
        }
        return String(item);
      }).join(' | ');
    }
    // Simple array - join with semicolon
    return value.map(String).join('; ');
  }
  
  // Handle objects - flatten to readable string
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
  }
  
  // Handle boolean
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Handle strings - check if it's an ISO date string
  if (typeof value === 'string') {
    // Try to parse as ISO date and format
    const dateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          });
        }
      } catch {
        // Not a valid date, return as is
      }
    }
  }
  
  return String(value);
}

/**
 * Format header name for readability
 */
function formatHeaderName(key: string): string {
  // Remove _id if it's MongoDB's internal ID
  if (key === '_id') {
    return 'Database ID';
  }
  
  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Get column order priority for better organization
 */
function getColumnOrder(key: string): number {
  const order: Record<string, number> = {
    'id': 1,
    'category': 2,
    'type': 3,
    'rxNumber': 4,
    'productName': 5,
    'prescriberName': 6,
    'prescriberLicense': 7,
    'prescriberFax': 8,
    'prescriberPhone': 9,
    'dateOfPrescription': 10,
    'claimStatus': 11,
    'status': 12,
    'phone': 13,
    'prescriptions': 14,
    'deliveryType': 15,
    'estimatedTime': 16,
    'service': 17,
    'preferredDateTime': 18,
    'authorizationNumber': 19,
    'caseNumber': 20,
    'din': 21,
    'itemNumber': 22,
    'priority': 23,
    'createdAt': 24,
    'updatedAt': 25,
  };
  
  return order[key] || 100; // Unknown columns go to the end
}

/**
 * Write data to a sheet (organized format, Excel-friendly)
 */
async function writeDataToSheet(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  data: any[]
): Promise<void> {
  if (data.length === 0) {
    // Write empty sheet message
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[`No data available for ${sheetName}`]],
      },
    });
    return;
  }

  // Get all unique keys from all documents
  const allKeys = new Set<string>();
  data.forEach((doc: any) => {
    Object.keys(doc).forEach((key) => {
      // Skip MongoDB's _id in favor of our id field
      if (key !== '_id' || !doc.id) {
        allKeys.add(key);
      }
    });
  });

  // Sort keys by priority, then alphabetically
  const headers = Array.from(allKeys).sort((a, b) => {
    const orderA = getColumnOrder(a);
    const orderB = getColumnOrder(b);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.localeCompare(b);
  });
  
  // Format headers for readability
  const formattedHeaders = headers.map(formatHeaderName);
  
  // Convert documents to rows with formatted values
  const rows = data.map((doc: any) => {
    return headers.map((header) => {
      const value = doc[header];
      return formatValueForExcel(value);
    });
  });

  // Prepare data: headers, then data rows
  const values = [
    formattedHeaders, // Header row with formatted names
    ...rows, // Data rows with formatted values
  ];

  // Clear the sheet first, then write new data
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
  });

  // Write to sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values,
    },
  });

  // Format header row (bold, freeze first row)
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);
    if (sheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            // Bold header row
            {
              repeatCell: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                    backgroundColor: {
                      red: 0.9,
                      green: 0.9,
                      blue: 0.9,
                    },
                  },
                },
                fields: 'userEnteredFormat(textFormat,backgroundColor)',
              },
            },
            // Freeze first row
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheet.properties.sheetId,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
                fields: 'gridProperties.frozenRowCount',
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    // Continue if formatting fails - data is still written
  }
}

/**
 * Write collection data to a sheet (for other collections)
 */
async function writeCollectionToSheet(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  backup: BackupData
): Promise<void> {
  if (backup.data.length === 0) {
    // Write empty collection header
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[`Collection: ${backup.collection} (Empty)`]],
      },
    });
    return;
  }

  // Get all unique keys from all documents
  const allKeys = new Set<string>();
  backup.data.forEach((doc: any) => {
    Object.keys(doc).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  
  // Convert documents to rows
  const rows = backup.data.map((doc: any) => {
    return headers.map((header) => {
      const value = doc[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        return JSON.stringify(value);
      }
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);
    });
  });

  // Prepare data: collection name in first column, then headers, then data rows
  const values = [
    [`Collection: ${backup.collection}`, ...headers], // Header row
    ['', ...headers.map(() => '')], // Empty separator row
    ...rows.map((row) => [backup.collection, ...row]), // Data rows with collection name
    ['', ...headers.map(() => '')], // Empty separator row after collection
  ];

  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values,
    },
  });
}

/**
 * Create a summary sheet
 */
async function createSummarySheet(
  sheets: any,
  spreadsheetId: string,
  backupData: BackupData[],
  date: string
): Promise<void> {
  const summarySheetName = 'Summary';
  
  // Delete existing summary sheet if it exists
  const summarySheetId = await getSheetId(sheets, spreadsheetId, summarySheetName);
  if (summarySheetId !== null) {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteSheet: { sheetId: summarySheetId },
          }],
        },
      });
    } catch (error) {
      // Continue if sheet deletion fails - will overwrite anyway
    }
  }

  // Create new summary sheet
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: summarySheetName,
          },
        },
      }],
    },
  });

  // Organize summary by category/type
  const claimsData = backupData.find(b => b.collection === 'claims');
  const requestsData = backupData.find(b => b.collection === 'requests');
  const otherCollections = backupData.filter(b => b.collection !== 'claims' && b.collection !== 'requests');

  const claimsByCategory = claimsData ? {
    'Medications': claimsData.data.filter((c: any) => c.category === 'medications').length,
    'Appeals': claimsData.data.filter((c: any) => c.category === 'appeals').length,
    'Manual Claims': claimsData.data.filter((c: any) => c.category === 'manual-claims').length,
    'Diapers and Pads': claimsData.data.filter((c: any) => c.category === 'diapers-pads').length,
  } : {};

  const requestsByType = requestsData ? {
    'Refill Requests': requestsData.data.filter((r: any) => r.type === 'refill').length,
    'Consultation Requests': requestsData.data.filter((r: any) => r.type === 'consultation').length,
  } : {};

  // Write summary data
  const summaryData = [
    ['Backup Summary'],
    ['Date', date],
    [''],
    ['Category/Type', 'Record Count', 'Backup Time'],
    ...Object.entries(claimsByCategory).map(([category, count]) => [
      category,
      count.toString(),
      claimsData?.backupDate || date,
    ]),
    ...Object.entries(requestsByType).map(([type, count]) => [
      type,
      count.toString(),
      requestsData?.backupDate || date,
    ]),
    ...otherCollections.map((backup) => [
      backup.collection,
      backup.data.length.toString(),
      backup.backupDate,
    ]),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${summarySheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: summaryData,
    },
  });
}

/**
 * Main backup function
 */
export async function performBackup(): Promise<{ success: boolean; spreadsheetId?: string; error?: string }> {
  try {
    const backupData = await exportMongoCollections();
    const spreadsheetId = await uploadToGoogleSheets(backupData);

    return {
      success: true,
      spreadsheetId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

