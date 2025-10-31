import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export interface ClaimDocument {
  id: string;
  category: 'medications' | 'appeals' | 'manual-claims' | 'diapers-pads';
  rxNumber: string;
  productName: string;
  prescriberName: string;
  prescriberLicense: string;
  prescriberFax?: string;
  prescriberPhone?: string;
  dateOfPrescription: string;
  type: 'new' | 'renewal' | 'prior-authorization';
  claimStatus: 'new' | 'case-number-open' | 'authorized';
  authorizationNumber?: string;
  authorizationStartDate?: string;
  authorizationEndDate?: string;
  documents: Array<{
    filename: string;
    filePath: string;
    uploadDate: string;
  }>;
  notes: Array<{
    id: string;
    text: string;
    staffUsername: string;
    timestamp: string;
  }>;
  priority: boolean;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'claims';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newClaim: ClaimDocument = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: body.category,
      rxNumber: body.rxNumber,
      productName: body.productName,
      prescriberName: body.prescriberName,
      prescriberLicense: body.prescriberLicense,
      prescriberFax: body.prescriberFax || '',
      prescriberPhone: body.prescriberPhone || '',
      dateOfPrescription: body.dateOfPrescription,
      type: body.type,
      claimStatus: body.claimStatus,
      authorizationNumber: body.authorizationNumber || '',
      authorizationStartDate: body.authorizationStartDate || '',
      authorizationEndDate: body.authorizationEndDate || '',
      documents: body.documents || [],
      notes: body.notes || [],
      priority: body.priority || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const collection = await getCollection(COLLECTION_NAME);
    await collection.insertOne(newClaim);

    return NextResponse.json({ 
      success: true, 
      claim: newClaim
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const id = searchParams.get('id');
    
    const collection = await getCollection(COLLECTION_NAME);
    
    if (id) {
      const claim = await collection.findOne({ id });
      if (!claim) {
        return NextResponse.json(
          { success: false, error: 'Claim not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, claim });
    } else {
      const query = category ? { category } : {};
      // Temporarily return empty data for manual-claims category per product request
      if (category === 'manual-claims') {
        return NextResponse.json({ success: true, claims: [] });
      }
      const claims = await collection.find(query).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ success: true, claims });
    }
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get('id');
    const { id: idFromBody, ...updateData } = body;
    const id = idFromBody || idFromQuery || '';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.updateOne(
      { id },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
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
      message: 'Claim updated successfully'
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Claim deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting claim:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete claim' },
      { status: 500 }
    );
  }
}

