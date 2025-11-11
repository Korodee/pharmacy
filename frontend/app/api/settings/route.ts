import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export interface Settings {
  id: string;
  enablePrinting: boolean;
  enableNotifications: boolean;
  sendToFaxByDefault: boolean;
  updatedAt: string;
}

const COLLECTION_NAME = 'settings';
const SETTINGS_ID = 'order_settings'; // Single settings document ID

export async function GET() {
  try {
    const collection = await getCollection(COLLECTION_NAME);
    const settings = await collection.findOne({ id: SETTINGS_ID });

    // Return default settings if none exist
    if (!settings) {
      const defaultSettings: Settings = {
        id: SETTINGS_ID,
        enablePrinting: true,
        enableNotifications: false,
        sendToFaxByDefault: true,
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, settings: defaultSettings });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enablePrinting, enableNotifications, sendToFaxByDefault } = body;

    const collection = await getCollection(COLLECTION_NAME);
    const now = new Date().toISOString();

    const settings: Settings = {
      id: SETTINGS_ID,
      enablePrinting: enablePrinting ?? true,
      enableNotifications: enableNotifications ?? false,
      sendToFaxByDefault: sendToFaxByDefault ?? true,
      updatedAt: now,
    };

    // Upsert settings
    await collection.updateOne(
      { id: SETTINGS_ID },
      { $set: settings },
      { upsert: true }
    );

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

