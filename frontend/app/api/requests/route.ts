import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getCollection } from '@/lib/mongodb';

export interface RefillRequest {
  id: string;
  type: 'refill';
  phone: string;
  prescriptions: string[];
  deliveryType: string;
  estimatedTime: string;
  comments: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface ConsultationRequest {
  id: string;
  type: 'consultation';
  phone: string;
  service: string;
  preferredDateTime: string;
  additionalNote: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export type RequestData = RefillRequest | ConsultationRequest;

// MongoDB collection name
const COLLECTION_NAME = 'requests';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    const newRequest: RequestData = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      ...data,
      status: 'pending',
      createdAt: new Date(),
    };

    // Save to MongoDB
    const collection = await getCollection(COLLECTION_NAME);
    await collection.insertOne(newRequest);

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@kateripharmacy.com',
        subject: `New ${type === 'refill' ? 'Refill' : 'Consultation'} Request`,
        html: generateEmailTemplate(newRequest),
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      requestId: newRequest.id,
      message: 'Request submitted successfully' 
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch from MongoDB
    const collection = await getCollection(COLLECTION_NAME);
    const requests = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ 
      success: true, 
      requests 
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// Helper function to format phone number for email display
function formatPhoneForEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  // Format as North American: +1 (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone; // Return as-is if not 10 digits
}


function generateEmailTemplate(request: RequestData): string {
  const isRefill = request.type === 'refill';
  const title = isRefill ? 'Refill Request' : 'Consultation Request';
  const icon = isRefill ? '💊' : '🩺';
  const statusColor = request.status === 'pending' ? '#F59E0B' : request.status === 'in-progress' ? '#3B82F6' : '#10B981';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New ${title} - Kateri Pharmacy</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0A438C 0%, #0A7BB2 100%); padding: 32px 24px; text-align: center;">
          <div style="display: inline-block; background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 50%; margin-bottom: 16px;">
            <span style="font-size: 32px;">${icon}</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
            New ${title}
          </h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">
            Kateri Pharmacy - Professional Healthcare Services
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          
          <!-- Request Info Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="margin-bottom: 16px;"></div>
              <h2 style="color: #1e293b; margin: 0; font-size: 20px; font-weight: 600;">Request Information</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
              <div style="margin-bottom: 16px;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Request ID</p>
                <p style="color: #1e293b; margin: 0; font-size: 14px; font-weight: 500; font-family: 'Monaco', 'Menlo', monospace;">${request.id}</p>
              </div>
              <div style="margin-bottom: 16px;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</p>
                <p style="color: #1e293b; margin: 0; font-size: 14px; font-weight: 500;">${formatPhoneForEmail(request.phone)}</p>
              </div>
              <div style="margin-bottom: 16px;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Submitted</p>
                <p style="color: #1e293b; margin: 0; font-size: 14px; font-weight: 500;">${new Date(request.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <!-- Details Section -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              <span style="background: #0A438C; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px;">${isRefill ? '1' : '1'}</span>
              ${isRefill ? 'Prescription Details' : 'Consultation Details'}
            </h3>
            
            ${isRefill ? `
              <div style="margin-bottom: 20px;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Prescriptions</p>
                <div style="background: #f1f5f9; border-radius: 8px; padding: 16px;">
                  ${(request as RefillRequest).prescriptions.filter(rx => rx.trim()).map(rx => `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center;">
                      <span style="color: #0A438C; margin-right: 8px; font-size: 16px;">💊</span>
                      <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${rx}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div style="margin-bottom: 16px;">
                  <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Type</p>
                  <p style="color: #1e293b; margin: 0; font-size: 14px; font-weight: 500; text-transform: capitalize;">${(request as RefillRequest).deliveryType}</p>
                </div>
                <div style="margin-bottom: 16px;">
                  <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Time</p>
                  <p style="color: #1e293b; margin: 0; font-size: 14px; font-weight: 500;">${(request as RefillRequest).estimatedTime || 'Not specified'}</p>
                </div>
              </div>
              
              ${(request as RefillRequest).comments ? `
                <div>
                  <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Comments</p>
                  <div style="background: #f1f5f9; border-radius: 8px; padding: 16px;">
                    <p style="color: #1e293b; margin: 0; font-size: 14px; line-height: 1.5;">${(request as RefillRequest).comments}</p>
                  </div>
                </div>
              ` : ''}
            ` : `
              <div style="margin-bottom: 20px;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Requested Service</p>
                <div style="background: #f1f5f9; border-radius: 8px; padding: 16px;">
                  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; align-items: center;">
                    <span style="color: #0A438C; margin-right: 8px; font-size: 16px;">🩺</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${(request as ConsultationRequest).service === 'uti' ? 'Testing and treatment for UTI' : 
                      (request as ConsultationRequest).service === 'strep' ? 'Testing and treatment for Strep A' :
                      (request as ConsultationRequest).service === 'travel' ? 'Traveller\'s Health' :
                      (request as ConsultationRequest).service === 'sinus' ? 'Sinus Infection' :
                      (request as ConsultationRequest).service === 'allergies' ? 'Allergies Treatment' :
                      (request as ConsultationRequest).service}</span>
                  </div>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <p style="color: #64748b; margin: 0 0 4px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Preferred Date & Time</p>
                  <p style="color: #1e293b; margin: 0; font-size: 14px; font-weight: 500;">${(request as ConsultationRequest).preferredDateTime ? new Date((request as ConsultationRequest).preferredDateTime).toLocaleString() : 'Not specified'}</p>
                </div>
                <div>
                  <p style="color: #64748b; margin: 0 0 4px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contact Information</p>
                  <p style="color: #1e293b; margin: 0; font-size: 14px; font-weight: 500;">${formatPhoneForEmail(request.phone)}</p>
                </div>
              </div>
              
              ${(request as ConsultationRequest).additionalNote ? `
                <div>
                  <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Additional Notes</p>
                  <div style="background: #f1f5f9; border-radius: 8px; padding: 16px;">
                    <p style="color: #1e293b; margin: 0; font-size: 14px; line-height: 1.5;">${(request as ConsultationRequest).additionalNote}</p>
                  </div>
                </div>
              ` : ''}
            `}
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" 
               style="display: inline-block; background: linear-gradient(135deg, #0A438C 0%, #0A7BB2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(10, 67, 140, 0.3); transition: all 0.2s;">
              <span style="margin-right: 8px;">📊</span>
              View in Admin Dashboard
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
            <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">Kateri Pharmacy</p>
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">Professional Healthcare Services</p>
            <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 11px;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
