#!/usr/bin/env node

/**
 * Helper script to format Google Service Account key for environment variable
 * 
 * Usage:
 *   node scripts/format-google-key.js path/to/service-account-key.json
 * 
 * This will output the JSON as a single-line string suitable for .env.local
 */

const fs = require('fs');
const path = require('path');

const keyFilePath = process.argv[2];

if (!keyFilePath) {
  console.error('Usage: node scripts/format-google-key.js <path-to-service-account-key.json>');
  process.exit(1);
}

try {
  const keyFile = fs.readFileSync(keyFilePath, 'utf8');
  const keyData = JSON.parse(keyFile);
  
  // Convert to single-line JSON string with escaped quotes
  const formattedKey = JSON.stringify(keyData);
  
  console.log('\n✅ Formatted Google Service Account Key:\n');
  console.log('GOOGLE_SERVICE_ACCOUNT_KEY=' + formattedKey);
  console.log('\n📋 Copy the line above and paste it into your .env.local file\n');
  console.log('Service Account Email:', keyData.client_email);
  console.log('\n');
} catch (error) {
  console.error('Error reading or parsing key file:', error.message);
  process.exit(1);
}

