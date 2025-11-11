#!/bin/bash

# Backup Setup Helper Script
# This script helps you set up the backup system step by step

echo "🔄 Kateri Pharmacy Backup Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "📝 Creating .env.local from template..."
    cp env.local.example .env.local
    echo "✅ Created .env.local"
    echo ""
fi

# Check for MongoDB URI
if grep -q "MONGODB_URI=" .env.local; then
    echo "✅ MongoDB URI is configured"
else
    echo "⚠️  MongoDB URI not found in .env.local"
    echo "   Please add: MONGODB_URI=your_mongodb_connection_string"
    echo ""
fi

# Check for Google credentials
if grep -q "GOOGLE_SERVICE_ACCOUNT_KEY=" .env.local && ! grep -q "GOOGLE_SERVICE_ACCOUNT_KEY=your" .env.local; then
    echo "✅ Google Service Account Key is configured"
else
    echo "⚠️  Google Service Account Key not configured"
    echo "   Please add: GOOGLE_SERVICE_ACCOUNT_KEY={...}"
    echo ""
fi

if grep -q "GOOGLE_BACKUP_SPREADSHEET_ID=" .env.local && ! grep -q "GOOGLE_BACKUP_SPREADSHEET_ID=your" .env.local; then
    echo "✅ Google Backup Spreadsheet ID is configured"
else
    echo "⚠️  Google Backup Spreadsheet ID not configured"
    echo "   Please add: GOOGLE_BACKUP_SPREADSHEET_ID=your-spreadsheet-id"
    echo ""
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. If you haven't set up Google Cloud:"
echo "   - Follow the guide in SETUP_BACKUP_STEPS.md"
echo ""
echo "2. If you have the service account key JSON file:"
echo "   node scripts/format-google-key.js <path-to-key.json>"
echo ""
echo "3. Add the formatted key to .env.local:"
echo "   GOOGLE_SERVICE_ACCOUNT_KEY={\"type\":\"service_account\",...}"
echo ""
echo "4. Add the spreadsheet ID to .env.local:"
echo "   GOOGLE_BACKUP_SPREADSHEET_ID=your-spreadsheet-id"
echo ""
echo "5. Test the backup:"
echo "   pnpm run backup"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - SETUP_BACKUP_STEPS.md (step-by-step guide)"
echo "   - BACKUP_QUICKSTART.md (quick reference)"
echo "   - BACKUP_SETUP.md (detailed documentation)"
echo ""

