import { NextRequest, NextResponse } from 'next/server';
import { appendToFeedbackStore } from '@/lib/storageHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const refId = `PCP-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const entry = {
      type: 'pcp_referral_email',
      refId,
      doctorName: body.doctorName || '',
      doctorEmail: body.doctorEmail || '',
      childName: body.childName || 'Anonymous Child',
      triageTitle: body.triageResult?.title || '',
      triageCategory: body.triageResult?.category || '',
      actionPlan: body.triageResult?.actionPlan || [],
      message: body.message || '',
      copySelf: Boolean(body.copySelf),
    };

    await appendToFeedbackStore(entry);

    return NextResponse.json({
      success: true,
      refId,
      message: 'PCP referral email summary successfully logged and queued',
    });
  } catch (error) {
    console.error('Error handling PCP email request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process PCP email' },
      { status: 500 }
    );
  }
}
