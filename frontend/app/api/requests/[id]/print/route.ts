import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { generateFaxPDF } from '@/lib/fax';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 requires params to be a Promise
    const resolvedParams = await params;
    const requestId = resolvedParams.id;

    // Fetch the request from MongoDB
    const collection = await getCollection('requests');
    const requestData = await collection.findOne({ id: requestId });

    if (!requestData) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Convert MongoDB document to the format expected by generateFaxPDF
    // Use the same format as in the POST route for consistency
    let createdAt: Date;
    if (requestData.createdAt instanceof Date) {
      createdAt = requestData.createdAt;
    } else if (typeof requestData.createdAt === 'string') {
      createdAt = new Date(requestData.createdAt);
    } else if (requestData.createdAt && typeof requestData.createdAt === 'object' && '$date' in requestData.createdAt) {
      // MongoDB date format
      createdAt = new Date((requestData.createdAt as any).$date);
    } else {
      // Fallback to current date if invalid
      createdAt = new Date();
    }

    // Validate required fields (same validation as fax sending)
    if (!requestData.id || !requestData.type || !requestData.phone) {
      const missingFields = [];
      if (!requestData.id) missingFields.push('id');
      if (!requestData.type) missingFields.push('type');
      if (!requestData.phone) missingFields.push('phone');
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Prepare request data in the same format as used for fax (ensures consistency)
    const requestForPDF = {
      id: requestData.id,
      type: requestData.type as 'refill' | 'consultation',
      phone: requestData.phone,
      createdAt: createdAt,
      // Include all other fields from the request
      ...requestData,
    };

    // Generate PDF
    const pdfBuffer = await generateFaxPDF(requestForPDF);

    // Convert Buffer to Uint8Array for NextResponse
    const pdfArray = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="request-${requestId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
    console.error('PDF generation error details:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

