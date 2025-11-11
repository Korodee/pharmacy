/**
 * Backup Cron Job Script
 * 
 * This script can be run manually or via a cron job to perform daily backups.
 * 
 * Usage:
 *   pnpm run backup
 * 
 * Or add to crontab:
 *   0 2 * * * cd /path/to/project/frontend && /usr/local/bin/pnpm run backup >> /var/log/backup.log 2>&1
 * 
 * Or using node directly (after building):
 *   0 2 * * * cd /path/to/project/frontend && node dist/scripts/backup-cron.js >> /var/log/backup.log 2>&1
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Also load .env if it exists (for fallback)
config({ path: resolve(process.cwd(), '.env') });

import { performBackup } from '../lib/backup';

async function main() {
  console.log(`[${new Date().toISOString()}] Starting scheduled backup...`);
  
  const result = await performBackup();
  
  if (result.success) {
    console.log(`[${new Date().toISOString()}] Backup completed successfully`);
    console.log(`Spreadsheet ID: ${result.spreadsheetId}`);
    process.exit(0);
  } else {
    console.error(`[${new Date().toISOString()}] Backup failed: ${result.error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`[${new Date().toISOString()}] Fatal error:`, error);
  process.exit(1);
});

