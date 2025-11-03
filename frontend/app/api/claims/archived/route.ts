import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ClaimDocument } from '../route';

export interface ArchivedClaimDocument extends ClaimDocument {
  archivedAt: string;
  deletionNote: string;
  archivedBy: string;
}

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection('archived_claims');
    const claims = await collection.find({}).sort({ archivedAt: -1 }).toArray();
    return NextResponse.json({ success: true, claims });
  } catch (error) {
    console.error('Error fetching archived claims:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch archived claims' },
      { status: 500 }
    );
  }
}

