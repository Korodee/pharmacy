import { NextRequest, NextResponse } from "next/server";
import { performBackup } from "@/lib/backup";

/**
 * POST /api/backup
 * Manually trigger a backup
 * Protected by API key if BACKUP_API_KEY is set
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (process.env.BACKUP_API_KEY && apiKey !== process.env.BACKUP_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await performBackup();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Backup completed successfully",
        spreadsheetId: result.spreadsheetId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Backup failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/backup
 * Get backup API status
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Backup API is available. Use POST to trigger a backup.',
  });
}

