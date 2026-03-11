import { NextResponse } from 'next/server';

/**
 * Slack Integration API
 *
 * GET /api/integrations/slack — Fetch recent mentions/DMs
 * POST /api/integrations/slack — Webhook handler for Slack Events API
 */

export async function GET() {
  // TODO: Implement with actual Slack API
  return NextResponse.json({
    messages: [],
    status: 'not_configured',
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Handle Slack URL verification challenge
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge });
  }

  // TODO: Handle Slack events (mentions, DMs)
  // Convert to IncomingSignal records
  console.log('Slack event received:', body.type);

  return NextResponse.json({ ok: true });
}
