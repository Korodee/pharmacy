import axios from 'axios';
import FormData from 'form-data';
import PDFDocument from 'pdfkit';

interface FaxData {
  recipientFax: string;
  recipientName: string;
  subject: string;
  notes: string;
  files?: Array<{
    filename: string;
    content: Buffer | string;
    contentType: string;
  }>;
}

interface DocumoResponse {
  success: boolean;
  faxId?: string;
  message?: string;
  error?: string;
}

/**
 * Formats phone number for display (e.g., (450) 638-5760)
 */
function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/**
 * Gets service display name from service code
 */
function getServiceDisplayName(service: string): string {
  const serviceMap: { [key: string]: string } = {
    'uti': 'Testing and Treatment for UTI',
    'strep': 'Testing and Treatment for Strep A',
    'travel': "Traveller's Health",
    'sinus': 'Sinus Infection',
    'allergies': 'Allergies Treatment',
    'diabetes': 'Diabetes Management',
    'contraception': 'Emergency Contraceptive Pill and Regular Contraception',
    'hair-lice': 'Hair Lice Treatment',
    'heartburn': 'Heartburn Treatment',
    'malaria': 'Mountain Sickness and Malaria',
    'pregnancy': 'Pregnancy Care',
    'shingles': 'Shingles Treatment',
    'throat': 'Throat Infection',
    'tick': 'Tick Bite Treatment',
    'travellers-diarrhea': "Traveller's Diarrhea",
    'smoking': 'Smoking Cessation',
  };
  return serviceMap[service] || service;
}

/**
 * Word wraps text to a maximum line length
 */
function wordWrap(text: string, maxLength: number, indent: string = '  '): string {
  const words = text.trim().split(/\s+/);
  let currentLine = '';
  let result = '';

  words.forEach((word) => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : indent) + word;
    } else {
      if (currentLine) result += currentLine + '\n';
      currentLine = indent + word;
    }
  });

  if (currentLine) result += currentLine + '\n';
  return result;
}

/**
 * Formats a phone number to a fax number format (removes non-digit characters)
 * @param phone - Phone number to format
 * @returns Formatted fax number (e.g., 14506385760)
 */
export function formatFaxNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // If it starts with 1 and has 11 digits, it's already formatted
  if (digits.length === 11 && digits[0] === '1') {
    return digits;
  }

  // If it has 10 digits, assume it's North American and add country code
  if (digits.length === 10) {
    return `1${digits}`;
  }

  // Return as-is if it doesn't match expected formats
  return digits;
}

/**
 * Sends a fax using Documo API
 * @param faxData - The fax data including recipient, subject, notes, and files
 * @returns Promise with the API response
 */
export async function sendFax(faxData: FaxData): Promise<DocumoResponse> {
  const DOCUMO_API_KEY = process.env.DOCUMO_API_KEY;
  const DOCUMO_API_URL = 'https://api.documo.com/v1/fax/send';

  if (!DOCUMO_API_KEY) {
    console.error('DOCUMO_API_KEY is not configured');
    return {
      success: false,
      error: 'Fax service not configured: DOCUMO_API_KEY is missing',
    };
  }

  if (!faxData.recipientFax) {
    return {
      success: false,
      error: 'Recipient fax number is required',
    };
  }

  try {
    const formData = new FormData();
    formData.append('recipientFax', faxData.recipientFax);
    formData.append('recipientName', faxData.recipientName || 'Recipient');
    formData.append('subject', faxData.subject);
    formData.append('notes', faxData.notes || '');

    // Add files if provided
    if (faxData.files && faxData.files.length > 0) {
      for (const file of faxData.files) {
        const buffer = Buffer.isBuffer(file.content)
          ? file.content
          : Buffer.from(file.content as string, 'utf-8');

        formData.append('files', buffer, {
          filename: file.filename,
          contentType: file.contentType,
        });
      }
    }

    // Note: Documo API uses Basic authentication
    // If authentication fails, you may need to adjust the format to:
    // - `Bearer ${DOCUMO_API_KEY}`
    // - `Basic ${Buffer.from(DOCUMO_API_KEY).toString('base64')}`
    // - Or check Documo API documentation for the exact format
    const response = await axios.post(DOCUMO_API_URL, formData, {
      headers: {
        'Authorization': `Basic ${DOCUMO_API_KEY}`,
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return {
      success: true,
      faxId: response.data.faxId || response.data.id,
      message: response.data.message || 'Fax sent successfully',
    };
  } catch (error) {
    console.error('Failed to send fax:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      return {
        success: false,
        error: `Documo API error: ${errorMessage}`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generates a professional plain text document from request data for faxing
 * @param requestData - The request data to convert to text
 * @returns Plain text content
 */
export function generateFaxDocument(requestData: {
  id: string;
  type: 'refill' | 'consultation';
  phone: string;
  createdAt: Date;
  [key: string]: any;
}): string {
  const isRefill = requestData.type === 'refill';
  const title = isRefill ? 'PRESCRIPTION REFILL REQUEST' : 'CONSULTATION REQUEST';
  const submittedDate = new Date(requestData.createdAt);

  const dateStr = submittedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = submittedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Pharmacy information
  const pharmacyName = process.env.PHARMACY_NAME || 'Kateri Pharmacy';
  const pharmacyPhone = process.env.PHARMACY_PHONE || '450-638-5760';
  const pharmacyFax = process.env.PHARMACY_FAX_NUMBER || '450-635-8249';
  const formattedPatientPhone = formatPhoneDisplay(requestData.phone);

  let document = '';

  // Header Section
  document += '\n\n';
  document += ' '.repeat(15) + '═'.repeat(70) + '\n';
  document += ' '.repeat(15) + ' '.repeat(25) + pharmacyName.toUpperCase() + '\n';
  document += ' '.repeat(15) + ' '.repeat(20) + 'Professional Healthcare Services' + '\n';
  document += ' '.repeat(15) + '═'.repeat(70) + '\n';
  document += '\n';

  // Document Title
  document += ' '.repeat(20) + '─'.repeat(60) + '\n';
  document += ' '.repeat(35) + title + '\n';
  document += ' '.repeat(20) + '─'.repeat(60) + '\n';
  document += '\n';

  // Request Information Section
  document += 'REQUEST INFORMATION\n';
  document += '═'.repeat(80) + '\n';
  document += `  Request ID:        ${requestData.id}\n`;
  document += `  Date Submitted:    ${dateStr}\n`;
  document += `  Time Submitted:    ${timeStr}\n`;
  document += `  Patient Phone:     ${formattedPatientPhone}\n`;
  document += `  Request Type:      ${isRefill ? 'Prescription Refill' : 'Consultation'}\n`;
  document += '\n';

  if (isRefill) {
    const refillData = requestData as any;

    // Prescription Details Section
    document += 'PRESCRIPTION DETAILS\n';
    document += '═'.repeat(80) + '\n';

    if (refillData.prescriptions?.length > 0) {
      const validPrescriptions = refillData.prescriptions.filter((rx: string) => rx?.trim());
      if (validPrescriptions.length > 0) {
        validPrescriptions.forEach((rx: string, index: number) => {
          document += `  ${index + 1}. ${rx.trim()}\n`;
        });
      } else {
        document += '  No prescriptions specified.\n';
      }
    } else {
      document += '  No prescriptions specified.\n';
    }
    document += '\n';

    // Delivery Information Section
    document += 'DELIVERY INFORMATION\n';
    document += '═'.repeat(80) + '\n';
    const deliveryType = refillData.deliveryType || 'Not specified';
    document += `  Delivery Type:     ${deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)}\n`;

    if (refillData.estimatedTime) {
      document += `  Estimated Time:    ${refillData.estimatedTime}\n`;
    }

    if (refillData.preferredDate) {
      const preferredDate = new Date(refillData.preferredDate);
      const formattedDate = preferredDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      document += `  Preferred Date:    ${formattedDate}\n`;
    }

    if (refillData.preferredTime) {
      document += `  Preferred Time:    ${refillData.preferredTime}\n`;
    }
    document += '\n';

    // Additional Comments Section
    if (refillData.comments?.trim()) {
      document += 'ADDITIONAL COMMENTS\n';
      document += '═'.repeat(80) + '\n';
      document += wordWrap(refillData.comments, 70);
      document += '\n';
    }
  } else {
    const consultationData = requestData as any;

    // Consultation Details Section
    document += 'CONSULTATION DETAILS\n';
    document += '═'.repeat(80) + '\n';
    document += `  Service Requested: ${getServiceDisplayName(consultationData.service || 'Not specified')}\n`;
    document += '\n';

    // Preferred Date & Time Section
    if (consultationData.preferredDateTime) {
      document += 'PREFERRED APPOINTMENT TIME\n';
      document += '═'.repeat(80) + '\n';
      try {
        const preferredDate = new Date(consultationData.preferredDateTime);
        const formattedDate = preferredDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedTime = preferredDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        document += `  Date: ${formattedDate}\n`;
        document += `  Time: ${formattedTime}\n`;
      } catch {
        document += `  ${consultationData.preferredDateTime}\n`;
      }
      document += '\n';
    }

    // Additional Notes Section
    if (consultationData.additionalNote?.trim()) {
      document += 'ADDITIONAL NOTES\n';
      document += '═'.repeat(80) + '\n';
      document += wordWrap(consultationData.additionalNote, 70);
      document += '\n';
    }
  }

  // Footer Section
  document += '\n';
  document += '═'.repeat(80) + '\n';
  document += 'ACTION REQUIRED\n';
  document += '═'.repeat(80) + '\n';
  document += `  This is an automated request submitted through the ${pharmacyName} website.\n`;
  document += `  Please contact the patient at ${formattedPatientPhone} to proceed with this request.\n`;
  document += '\n';
  document += 'CONTACT INFORMATION\n';
  document += '═'.repeat(80) + '\n';
  document += `  ${pharmacyName}\n`;
  document += `  Phone: ${pharmacyPhone}\n`;
  document += `  Fax: ${pharmacyFax}\n`;
  document += '\n\n';

  return document;
}

/**
 * Generates a professional PDF document from request data for faxing
 * @param requestData - The request data to convert to PDF
 * @returns Promise that resolves to PDF buffer
 */
export async function generateFaxPDF(requestData: {
  id: string;
  type: 'refill' | 'consultation';
  phone: string;
  createdAt: Date;
  [key: string]: any;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const isRefill = requestData.type === 'refill';
      const title = isRefill ? 'PRESCRIPTION REFILL REQUEST' : 'CONSULTATION REQUEST';
      const submittedDate = new Date(requestData.createdAt);

      const dateStr = submittedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const timeStr = submittedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Pharmacy information
      const pharmacyName = process.env.PHARMACY_NAME || 'Kateri Pharmacy';
      const pharmacyPhone = process.env.PHARMACY_PHONE || '450-638-5760';
      const pharmacyFax = process.env.PHARMACY_FAX_NUMBER || '450-635-8249';
      const formattedPatientPhone = formatPhoneDisplay(requestData.phone);

      // Header Section
      doc.fontSize(20)
         .fillColor('#0A438C')
         .text(pharmacyName.toUpperCase(), { align: 'center' });

      doc.fontSize(11)
         .fillColor('#666666')
         .text('Professional Healthcare Services', { align: 'center' });

      doc.moveDown(1.5);

      // Draw header line
      doc.strokeColor('#0A438C')
         .lineWidth(2)
         .moveTo(50, doc.y)
         .lineTo(562, doc.y)
         .stroke();

      doc.moveDown(1);

      // Document Title
      doc.fontSize(16)
         .fillColor('#000000')
         .text(title, { align: 'center', underline: true });

      doc.moveDown(1.5);

      // Request Information Section
      doc.fontSize(11)
         .fillColor('#0A438C')
         .text('REQUEST INFORMATION', { underline: true });

      doc.moveDown(0.5);
      doc.fontSize(10)
         .fillColor('#000000')
         .text(`Request ID:        ${requestData.id}`);
      doc.text(`Date Submitted:    ${dateStr}`);
      doc.text(`Time Submitted:    ${timeStr}`);
      doc.text(`Patient Phone:     ${formattedPatientPhone}`);
      doc.text(`Request Type:      ${isRefill ? 'Prescription Refill' : 'Consultation'}`);

      doc.moveDown(1);

      if (isRefill) {
        const refillData = requestData as any;

        // Prescription Details Section
        doc.fontSize(11)
           .fillColor('#0A438C')
           .text('PRESCRIPTION DETAILS', { underline: true });

        doc.moveDown(0.5);
        doc.fontSize(10)
           .fillColor('#000000');

        if (refillData.prescriptions?.length > 0) {
          const validPrescriptions = refillData.prescriptions.filter((rx: string) => rx?.trim());
          if (validPrescriptions.length > 0) {
            validPrescriptions.forEach((rx: string, index: number) => {
              doc.text(`${index + 1}. ${rx.trim()}`);
            });
          } else {
            doc.text('No prescriptions specified.');
          }
        } else {
          doc.text('No prescriptions specified.');
        }

        doc.moveDown(1);

        // Delivery Information Section
        doc.fontSize(11)
           .fillColor('#0A438C')
           .text('DELIVERY INFORMATION', { underline: true });

        doc.moveDown(0.5);
        doc.fontSize(10)
           .fillColor('#000000');
        const deliveryType = refillData.deliveryType || 'Not specified';
        doc.text(`Delivery Type:     ${deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)}`);

        if (refillData.estimatedTime) {
          doc.text(`Estimated Time:    ${refillData.estimatedTime}`);
        }

        if (refillData.preferredDate) {
          const preferredDate = new Date(refillData.preferredDate);
          const formattedDate = preferredDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          doc.text(`Preferred Date:    ${formattedDate}`);
        }

        if (refillData.preferredTime) {
          doc.text(`Preferred Time:    ${refillData.preferredTime}`);
        }

        doc.moveDown(1);

        // Additional Comments Section
        if (refillData.comments?.trim()) {
          doc.fontSize(11)
             .fillColor('#0A438C')
             .text('ADDITIONAL COMMENTS', { underline: true });

          doc.moveDown(0.5);
          doc.fontSize(10)
             .fillColor('#000000')
             .text(refillData.comments.trim(), {
               align: 'left',
               width: 462,
             });

          doc.moveDown(1);
        }
      } else {
        const consultationData = requestData as any;

        // Consultation Details Section
        doc.fontSize(11)
           .fillColor('#0A438C')
           .text('CONSULTATION DETAILS', { underline: true });

        doc.moveDown(0.5);
        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Service Requested: ${getServiceDisplayName(consultationData.service || 'Not specified')}`);

        doc.moveDown(1);

        // Preferred Date & Time Section
        if (consultationData.preferredDateTime) {
          doc.fontSize(11)
             .fillColor('#0A438C')
             .text('PREFERRED APPOINTMENT TIME', { underline: true });

          doc.moveDown(0.5);
          doc.fontSize(10)
             .fillColor('#000000');

          try {
            const preferredDate = new Date(consultationData.preferredDateTime);
            const formattedDate = preferredDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const formattedTime = preferredDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });
            doc.text(`Date: ${formattedDate}`);
            doc.text(`Time: ${formattedTime}`);
          } catch {
            doc.text(`${consultationData.preferredDateTime}`);
          }

          doc.moveDown(1);
        }

        // Additional Notes Section
        if (consultationData.additionalNote?.trim()) {
          doc.fontSize(11)
             .fillColor('#0A438C')
             .text('ADDITIONAL NOTES', { underline: true });

          doc.moveDown(0.5);
          doc.fontSize(10)
             .fillColor('#000000')
             .text(consultationData.additionalNote.trim(), {
               align: 'left',
               width: 462,
             });

          doc.moveDown(1);
        }
      }

      // Footer Section
      doc.moveDown(1);
      doc.strokeColor('#0A438C')
         .lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(562, doc.y)
         .stroke();

      doc.moveDown(1);
      doc.fontSize(11)
         .fillColor('#0A438C')
         .text('ACTION REQUIRED', { underline: true });

      doc.moveDown(0.5);
      doc.fontSize(10)
         .fillColor('#000000')
         .text(`This is an automated request submitted through the ${pharmacyName} website.`);
      doc.text(`Please contact the patient at ${formattedPatientPhone} to proceed with this request.`);

      doc.moveDown(1);
      doc.fontSize(11)
         .fillColor('#0A438C')
         .text('CONTACT INFORMATION', { underline: true });

      doc.moveDown(0.5);
      doc.fontSize(10)
         .fillColor('#000000')
         .text(pharmacyName);
      doc.text(`Phone: ${pharmacyPhone}`);
      doc.text(`Fax: ${pharmacyFax}`);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
