import { NextRequest, NextResponse } from 'next/server';
import { appendToFeedbackStore } from '@/lib/storageHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const entry = {
      type: body.type || 'general_feedback',
      rating: body.rating ?? null,
      helpful: body.helpful ?? null,
      helpedDecide: body.helpedDecide ?? null,
      visitType: body.visitType || null,
      selectedTags: body.selectedTags || [],
      comment: body.comment || body.feedback || '',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    await appendToFeedbackStore(entry);

    return NextResponse.json({
      success: true,
      message: 'Feedback successfully recorded',
    });
  } catch (error) {
    console.error('Error handling feedback submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}
