import { NextRequest, NextResponse } from 'next/server';
import { saveOrUpdateTriageCase } from '@/lib/storageHelper';
import { getAllLogs } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refId } = body;
    if (!refId) {
      return NextResponse.json({ success: false, message: 'Missing refId' }, { status: 400 });
    }

    const entry = {
      type: 'triage_case',
      refId,
      emailSent: body.emailSent ?? false,
      child: {
        name: body.child?.name || 'Anonymous Child',
        ageInMonths: body.child?.ageInMonths || 24,
        sex: body.child?.sex || 'Prefer not to say',
        weightKg: body.child?.weightKg ?? null,
        hasChronicConditions: body.child?.hasChronicConditions ?? false,
      },
      guardian: {
        relationship: body.guardian?.relationship || 'Parent',
        postalCode: body.guardian?.postalCode || 'M5G 1X8',
      },
      symptoms: body.symptoms || {},
      result: body.result || {},
    };

    await saveOrUpdateTriageCase(refId, entry);

    return NextResponse.json({ success: true, message: 'Triage case logged successfully' });
  } catch (error) {
    console.error('Error saving triage case:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const refId = url.searchParams.get('refId');

    const existingData = await getAllLogs();

    if (refId) {
      const alreadyAudited = existingData.some(
        (item) => item.type === 'provider_feedback' && item.refId === refId
      );
      if (alreadyAudited) {
        return NextResponse.json(
          { success: false, message: 'This case chart has already been audited by a provider and cannot be accessed again.' },
          { status: 403 }
        );
      }

      const triageCase = existingData.find(
        (item) => item.type === 'triage_case' && item.refId === refId
      );
      if (!triageCase) {
        return NextResponse.json({ success: false, message: 'Triage case not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: triageCase });
    }

    // Return all triage cases
    const allCases = existingData.filter((item) => item.type === 'triage_case');
    return NextResponse.json({ success: true, data: allCases });
  } catch (error) {
    console.error('Error fetching triage cases:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
