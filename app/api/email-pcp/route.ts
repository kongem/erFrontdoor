import { NextRequest, NextResponse } from 'next/server';
import { markTriageEmailSent } from '@/lib/storageHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const refId = body.refId || `PEDS-TRG-${Math.floor(100000 + Math.random() * 900000)}`;

    await markTriageEmailSent(refId, {
      doctorName: body.doctorName || '',
      doctorEmail: body.doctorEmail || '',
    });

    return NextResponse.json({
      success: true,
      refId,
      message: 'PCP referral email status successfully marked on triage case',
    });
  } catch (error) {
    console.error('Error handling PCP email request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process PCP email' },
      { status: 500 }
    );
  }
}
