import { NextRequest, NextResponse } from 'next/server';
import { insertLog, getAllLogs } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const entry = {
      type: body.type || 'general_feedback',
      refId: body.refId || null,
      rating: body.rating ?? null,
      accessRating: body.accessRating ?? null,
      completenessRating: body.completenessRating ?? null,
      helpful: body.helpful ?? null,
      helpedDecide: body.helpedDecide ?? null,
      skipped: body.skipped ?? null,
      visitType: body.visitType || null,
      selectedTags: body.selectedTags || [],
      comment: body.comment || body.feedback || '',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    await insertLog(entry);

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

export async function GET(request: NextRequest) {
  try {
    const data = await getAllLogs();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
