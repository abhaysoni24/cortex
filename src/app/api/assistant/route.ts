import { NextResponse } from 'next/server';
import { generateBriefing } from '@/lib/assistant/briefing';

export async function GET() {
  try {
    const briefing = await generateBriefing();
    return NextResponse.json(briefing);
  } catch (error) {
    console.error('Failed to generate briefing:', error);
    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
