import { NextResponse } from 'next/server';

/**
 * HubSpot Integration API
 *
 * GET /api/integrations/hubspot — Fetch pipeline/deals/contacts
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get('entity') || 'deals';

  // TODO: Implement with actual HubSpot API
  if (entity === 'deals') {
    return NextResponse.json({
      deals: [],
      pipeline: { total: 890000, stages: [] },
      status: 'not_configured',
    });
  }

  if (entity === 'contacts') {
    return NextResponse.json({
      contacts: [],
      status: 'not_configured',
    });
  }

  return NextResponse.json({ status: 'not_configured' });
}
