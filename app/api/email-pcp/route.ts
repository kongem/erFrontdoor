import { NextRequest, NextResponse } from 'next/server';
import { markTriageEmailSent } from '@/lib/storageHelper';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const refId = body.refId || `PEDS-TRG-${Math.floor(100000 + Math.random() * 900000)}`;

    await markTriageEmailSent(refId, {
      doctorName: body.doctorName || '',
      doctorEmail: body.doctorEmail || '',
    });

    const { doctorName, doctorEmail, childName, triageResult, message, guardian, child, symptoms, facility } = body;

    // 1. SMTP Credentials configuration
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
    const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT;
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'REVAMP Pediatric Triage <noreply@revamp-triage.ca>';

    let transporter;
    let previewUrl = '';

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      // Create real SMTP transport
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Generate Ethereal Email test account dynamically in development
      console.log('Generating Ethereal test SMTP credentials...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    const assessmentDate = new Date().toLocaleString('en-CA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Construct plain text body
    let plainText = `REVAMP Digital Triage - Clinical Assessment Summary\n`;
    plainText += `==================================================\n\n`;
    plainText += `Assessment Date: ${assessmentDate}\n`;
    plainText += `Reference ID: ${refId}\n`;
    plainText += `Protocol: AboutKidsHealth Triage Rules\n\n`;
    
    if (triageResult) {
      plainText += `TRIAGE CLASSIFICATION: ${triageResult.title}\n`;
      plainText += `Urgency Category: ${triageResult.category?.replace('_', ' ') || ''}\n`;
      plainText += `Summary: ${triageResult.summary || ''}\n\n`;
    }
    
    plainText += `PATIENT & GUARDIAN DETAILS:\n`;
    plainText += `--------------------------\n`;
    plainText += `- Patient (Child): ${child?.name || childName || 'Anonymous'}\n`;
    if (child?.ageInMonths) {
      plainText += `- Age: ${child.ageInMonths} months\n`;
    }
    if (child?.sex) {
      plainText += `- Sex: ${child.sex}\n`;
    }
    if (child?.weightKg) {
      plainText += `- Weight: ${child.weightKg} kg\n`;
    }
    if (guardian) {
      plainText += `- Guardian: ${guardian.name || 'Anonymous'} (${guardian.relationship || 'Guardian'})\n`;
      plainText += `- Contact Phone: ${guardian.phone || 'N/A'}\n`;
      plainText += `- Contact Email: ${guardian.email || 'N/A'}\n`;
      plainText += `- Postal Code: ${guardian.postalCode || 'N/A'}\n`;
    }
    plainText += `\n`;
    
    if (symptoms) {
      plainText += `REPORTED SYMPTOMS & CLINICAL INDICATORS:\n`;
      plainText += `---------------------------------------\n`;
      plainText += `- Primary Symptom: ${symptoms.primarySymptom ? symptoms.primarySymptom.replace('_', ' ') : 'Fever'}\n`;
      if (symptoms.primarySymptom === 'fever' && symptoms.hasFever) {
        plainText += `  (Temp: ${symptoms.feverTempCelsius}°C, Duration: ${symptoms.feverDurationHours} hours)\n`;
      }
      if (symptoms.selectedRedFlags && symptoms.selectedRedFlags.length > 0) {
        plainText += `- Red Flag Indicators: ${symptoms.selectedRedFlags.join(', ')}\n`;
      }
      if (symptoms.selectedSecondarySymptoms && symptoms.selectedSecondarySymptoms.length > 0) {
        plainText += `- Secondary Symptoms: ${symptoms.selectedSecondarySymptoms.join(', ')}\n`;
      }
      if (symptoms.additionalNotes) {
        plainText += `- Parent Notes: ${symptoms.additionalNotes}\n`;
      }
      plainText += `\n`;
    }
    
    if (triageResult?.actionPlan) {
      plainText += `RECOMMENDED CLINICAL ACTION PLAN:\n`;
      plainText += `-------------------------------\n`;
      triageResult.actionPlan.forEach((action: string) => {
        plainText += `- ${action}\n`;
      });
      plainText += `\n`;
    }
    
    if (facility) {
      plainText += `RECOMMENDED FACILITY:\n`;
      plainText += `--------------------\n`;
      plainText += `${facility.name}\n`;
      plainText += `${facility.address}\n`;
      plainText += `Phone: ${facility.phone}\n\n`;
    }
    
    plainText += `==================================================\n`;
    plainText += `Please visit https://er-frontdoor.vercel.app/provider to provide feedback.`;

    // Construct HTML body
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #0d9488; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">REVAMP Digital Triage Summary</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Clinical Assessment Document</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; background-color: #ffffff;">
          <p style="font-size: 12px; color: #64748b; margin-top: 0;">
            <strong>Date:</strong> ${assessmentDate} | <strong>Ref ID:</strong> <span style="font-family: monospace; font-weight: bold; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${refId}</span>
          </p>
          
          ${triageResult ? `
            <div style="background-color: ${triageResult.category === 'HIGH_EMERGENCY' ? '#fff1f2' : triageResult.category === 'MODERATE_URGENT_CARE' ? '#fef3c7' : '#f0fdf4'}; border: 1px solid ${triageResult.category === 'HIGH_EMERGENCY' ? '#fecdd3' : triageResult.category === 'MODERATE_URGENT_CARE' ? '#fde68a' : '#bbf7d0'}; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 4px 0; color: #0f172a; font-size: 15px;">Classification: <strong>${triageResult.title}</strong></h3>
              <p style="margin: 0; font-size: 13px; color: #334155;">${triageResult.summary}</p>
            </div>
          ` : ''}

          <h4 style="border-bottom: 2px solid #0d9488; padding-bottom: 4px; margin-top: 24px; font-size: 13px; text-transform: uppercase; color: #0d9488; letter-spacing: 0.5px;">Patient & Guardian Information</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; width: 40%; color: #64748b;">Patient Name:</td>
              <td style="padding: 4px 0; font-weight: bold;">${child?.name || childName || 'Anonymous'}</td>
            </tr>
            ${child?.ageInMonths ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Age:</td>
              <td style="padding: 4px 0; font-weight: bold;">${child.ageInMonths} months (~ ${(child.ageInMonths / 12).toFixed(1)} yrs)</td>
            </tr>` : ''}
            ${child?.sex ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Sex:</td>
              <td style="padding: 4px 0; font-weight: bold;">${child.sex}</td>
            </tr>` : ''}
            ${child?.weightKg ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Weight:</td>
              <td style="padding: 4px 0; font-weight: bold;">${child.weightKg} kg</td>
            </tr>` : ''}
            ${guardian ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Guardian / Contact:</td>
              <td style="padding: 4px 0; font-weight: bold;">${guardian.name || 'Anonymous'} (${guardian.relationship || 'Guardian'})</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Contact Details:</td>
              <td style="padding: 4px 0; font-weight: bold;">Phone: ${guardian.phone || 'N/A'} | Email: ${guardian.email || 'N/A'}</td>
            </tr>
            ` : ''}
          </table>

          ${symptoms ? `
            <h4 style="border-bottom: 2px solid #0d9488; padding-bottom: 4px; margin-top: 24px; font-size: 13px; text-transform: uppercase; color: #0d9488; letter-spacing: 0.5px;">Clinical Indicators</h4>
            <div style="font-size: 13px; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0;"><strong>Primary Concern:</strong> <span style="text-transform: capitalize;">${symptoms.primarySymptom ? symptoms.primarySymptom.replace('_', ' ') : 'Fever'}</span></p>
              ${symptoms.primarySymptom === 'fever' && symptoms.hasFever ? `
                <p style="margin: 0 0 6px 0; padding-left: 10px; color: #475569;">Fever Specs: <strong>${symptoms.feverTempCelsius}°C</strong> for <strong>${symptoms.feverDurationHours} hours</strong></p>
              ` : ''}
              ${symptoms.selectedRedFlags && symptoms.selectedRedFlags.length > 0 ? `
                <p style="margin: 0 0 6px 0;"><strong>Secondary Concerns:</strong> ${symptoms.selectedRedFlags.join(', ')}</p>
              ` : ''}
              ${symptoms.selectedSecondarySymptoms && symptoms.selectedSecondarySymptoms.length > 0 ? `
                <p style="margin: 0 0 6px 0;"><strong>Associated Symptoms:</strong> ${symptoms.selectedSecondarySymptoms.join(', ')}</p>
              ` : ''}
              ${symptoms.additionalNotes ? `
                <p style="margin: 6px 0 0 0; font-style: italic; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 6px;"><strong>Parent Notes:</strong> "${symptoms.additionalNotes}"</p>
              ` : ''}
            </div>
          ` : ''}

          ${triageResult?.actionPlan ? `
            <h4 style="border-bottom: 2px solid #0d9488; padding-bottom: 4px; margin-top: 24px; font-size: 13px; text-transform: uppercase; color: #0d9488; letter-spacing: 0.5px;">Recommended Actions</h4>
            <ul style="font-size: 13px; margin: 8px 0; padding-left: 20px; color: #334155;">
              ${triageResult.actionPlan.map((action: string) => `<li style="margin-bottom: 4px;">${action}</li>`).join('')}
            </ul>
          ` : ''}

          ${facility ? `
            <h4 style="border-bottom: 2px solid #0d9488; padding-bottom: 4px; margin-top: 24px; font-size: 13px; text-transform: uppercase; color: #0d9488; letter-spacing: 0.5px;">Primary Facility Recommended</h4>
            <div style="font-size: 13px; background-color: #0f172a; color: #ffffff; padding: 12px; border-radius: 8px;">
              <p style="margin: 0; font-weight: bold; color: #2dd4bf;">${facility.name}</p>
              <p style="margin: 4px 0 0 0; opacity: 0.9;">${facility.address}</p>
              <p style="margin: 4px 0 0 0; opacity: 0.9;">Phone: ${facility.phone}</p>
            </div>
          ` : ''}

          <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
            <p style="margin: 0;">This report is intended for the Patient's Primary Care Provider (PCP).</p>
            <p style="margin: 4px 0 0 0;">Please visit <a href="https://er-frontdoor.vercel.app/provider" style="color: #0d9488; text-decoration: none; font-weight: bold;">REVAMP Provider Portal</a> to review and give feedback.</p>
          </div>
        </div>
      </div>
    `;

    // Send email using transporter
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: doctorEmail,
      subject: `REVAMP Pediatric Triage Assessment: Ref ${refId}`,
      text: plainText,
      html: htmlBody,
    });

    console.log(`Triage summary email dispatched successfully! MessageID: ${info.messageId}`);
    
    // Get Ethereal preview link if applicable
    if (!smtpHost) {
      previewUrl = nodemailer.getTestMessageUrl(info) || '';
      console.log(`Test email preview URL: ${previewUrl}`);
    }

    return NextResponse.json({
      success: true,
      refId,
      previewUrl,
      message: 'Triage assessment summary successfully emailed by the server',
    });
  } catch (error) {
    console.error('Error handling PCP email request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process and send email' },
      { status: 500 }
    );
  }
}
