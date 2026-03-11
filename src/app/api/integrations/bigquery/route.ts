import { NextResponse } from 'next/server';

/**
 * BigQuery Integration API
 *
 * GET /api/integrations/bigquery — List saved queries
 * POST /api/integrations/bigquery — Execute a query
 */

export async function GET() {
  // TODO: Fetch saved queries from DB
  return NextResponse.json({
    queries: [],
    status: 'not_configured',
  });
}

export async function POST(request: Request) {
  const { sql, queryId } = await request.json();

  // TODO: Execute BigQuery query
  // For now, return placeholder
  console.log('BigQuery query:', sql || queryId);

  return NextResponse.json({
    columns: ['date', 'revenue', 'users'],
    rows: [
      { date: '2026-03-10', revenue: 4820, users: 1240 },
      { date: '2026-03-09', revenue: 5100, users: 1310 },
      { date: '2026-03-08', revenue: 3900, users: 980 },
    ],
    totalRows: 3,
    executionTime: '0.8s',
  });
}
