import { NextResponse } from 'next/server';

/**
 * Gmail Integration API
 *
 * GET /api/integrations/gmail — Fetch recent inbox threads
 * POST /api/integrations/gmail — Webhook handler for Gmail push notifications
 */

export async function GET() {
  // TODO: Implement with actual Gmail API
  return NextResponse.json({
    threads: [],
    status: 'not_configured',
  });
}

export async function POST() {
  // TODO: Handle Gmail push notifications
  // Convert to IncomingSignal records
  return NextResponse.json({ ok: true });
}
