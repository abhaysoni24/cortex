import { NextResponse } from 'next/server';

/**
 * Google Calendar Integration API
 *
 * GET /api/integrations/calendar — Fetch today's events
 * POST /api/integrations/calendar — Trigger sync
 */

export async function GET() {
  // TODO: Implement with actual Google Calendar API
  // For MVP, return placeholder events
  const events = [
    {
      id: 'evt-1',
      summary: 'Daily Standup',
      start: { dateTime: new Date().toISOString().split('T')[0] + 'T09:00:00' },
      end: { dateTime: new Date().toISOString().split('T')[0] + 'T09:30:00' },
      attendees: [{ email: 'team@company.com' }],
    },
    {
      id: 'evt-2',
      summary: 'Pipeline Review',
      start: { dateTime: new Date().toISOString().split('T')[0] + 'T14:00:00' },
      end: { dateTime: new Date().toISOString().split('T')[0] + 'T15:00:00' },
      attendees: [
        { email: 'sales@company.com' },
        { email: 'growth@company.com' },
      ],
    },
    {
      id: 'evt-3',
      summary: '1:1 with Sarah',
      start: { dateTime: new Date().toISOString().split('T')[0] + 'T16:00:00' },
      end: { dateTime: new Date().toISOString().split('T')[0] + 'T16:30:00' },
      attendees: [{ email: 'sarah@company.com' }],
    },
  ];

  return NextResponse.json({ events });
}

export async function POST() {
  // TODO: Trigger calendar sync
  return NextResponse.json({ status: 'sync_triggered' });
}
