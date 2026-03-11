import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { integrationCredentials, accounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/integrations/credentials
 * Returns status of all integrations (Google from accounts table, others from integration_credentials).
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check Google account link
  const [googleAccount] = await db
    .select({ provider: accounts.provider, access_token: accounts.access_token })
    .from(accounts)
    .where(and(eq(accounts.userId, session.user.id), eq(accounts.provider, 'google')))
    .limit(1);

  const googleConnected = !!googleAccount?.access_token;

  // Get non-Google credentials
  const creds = await db.select().from(integrationCredentials);
  const credMap = Object.fromEntries(creds.map((c) => [c.provider, c]));

  const statuses = {
    gmail: { status: googleConnected ? 'connected' : 'not_configured', lastSync: null },
    calendar: { status: googleConnected ? 'connected' : 'not_configured', lastSync: null },
    slack: {
      status: credMap.slack?.status ?? 'not_configured',
      lastSync: credMap.slack?.lastSyncAt?.toISOString() ?? null,
    },
    bigquery: {
      status: credMap.bigquery?.status ?? 'not_configured',
      lastSync: credMap.bigquery?.lastSyncAt?.toISOString() ?? null,
    },
    hubspot: {
      status: credMap.hubspot?.status ?? 'not_configured',
      lastSync: credMap.hubspot?.lastSyncAt?.toISOString() ?? null,
    },
    ga4: {
      status: credMap.ga4?.status ?? 'not_configured',
      lastSync: credMap.ga4?.lastSyncAt?.toISOString() ?? null,
    },
  };

  return NextResponse.json(statuses);
}

/**
 * POST /api/integrations/credentials
 * Save or update credentials for a non-Google provider.
 * Body: { provider: string, credentials: object }
 */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const { provider, credentials } = body;

  if (!provider || !credentials) {
    return NextResponse.json(
      { error: 'provider and credentials are required' },
      { status: 400 }
    );
  }

  const validProviders = ['slack', 'bigquery', 'hubspot', 'ga4'];
  if (!validProviders.includes(provider)) {
    return NextResponse.json(
      { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
      { status: 400 }
    );
  }

  // Upsert credentials
  const [existing] = await db
    .select()
    .from(integrationCredentials)
    .where(eq(integrationCredentials.provider, provider))
    .limit(1);

  if (existing) {
    await db
      .update(integrationCredentials)
      .set({
        credentials,
        status: 'connected',
      })
      .where(eq(integrationCredentials.provider, provider));
  } else {
    await db.insert(integrationCredentials).values({
      provider,
      credentials,
      status: 'connected',
    });
  }

  return NextResponse.json({ ok: true, provider, status: 'connected' });
}

/**
 * DELETE /api/integrations/credentials
 * Remove credentials for a provider.
 * Body: { provider: string }
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const { provider } = body;

  if (!provider) {
    return NextResponse.json({ error: 'provider is required' }, { status: 400 });
  }

  await db
    .delete(integrationCredentials)
    .where(eq(integrationCredentials.provider, provider));

  return NextResponse.json({ ok: true, provider, status: 'not_configured' });
}
