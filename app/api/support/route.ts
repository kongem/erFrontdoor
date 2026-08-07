import { NextRequest, NextResponse } from 'next/server';
import { appendToFeedbackStore } from '@/lib/storageHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const ticketNumber = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;

    const entry = {
      type: 'support_request',
      ticketNumber,
      parentName: body.parentName || 'Anonymous Parent',
      email: body.email || '',
      phone: body.phone || '',
      childAge: body.childAge || '',
      topic: body.topic || 'general',
      urgency: body.urgency || 'routine',
      message: body.message || '',
    };

    await appendToFeedbackStore(entry);

    return NextResponse.json({
      success: true,
      ticketNumber,
      message: 'Support request successfully recorded',
    });
  } catch (error) {
    console.error('Error handling support request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process support request' },
      { status: 500 }
    );
  }
}
