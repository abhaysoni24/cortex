import { NextResponse } from 'next/server';

/**
 * GA4 Integration API
 *
 * GET /api/integrations/ga4 — Fetch key metrics
 * POST /api/integrations/ga4 — Run custom report
 */

export async function GET() {
  // TODO: Implement with actual GA4 Data API
  return NextResponse.json({
    metrics: {
      activeUsers: 12450,
      sessions: 34200,
      bounceRate: 0.42,
      avgSessionDuration: 185,
    },
    status: 'not_configured',
  });
}

export async function POST(request: Request) {
  const reportConfig = await request.json();

  // TODO: Run GA4 report with actual API
  console.log('GA4 report config:', reportConfig);

  return NextResponse.json({
    dimensions: [],
    metrics: [],
    rows: [],
    status: 'not_configured',
  });
}
