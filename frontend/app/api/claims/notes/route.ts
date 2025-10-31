import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

const COLLECTION_NAME = 'claims';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId, text, staffUsername } = body;

    if (!claimId || !text || !staffUsername) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      staffUsername,
      timestamp: new Date().toISOString(),
    };

    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.updateOne(
      { id: claimId },
      { 
        $push: { notes: newNote } as any,
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      note: newNote
    });
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add note' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get('claimId');
    const noteId = searchParams.get('noteId');

    if (!claimId || !noteId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.updateOne(
      { id: claimId },
      { 
        $pull: { notes: { id: noteId } } as any,
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}

