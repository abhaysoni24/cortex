import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getGoogleTokens } from '@/lib/auth/google-tokens';
import { fetchInboxThreads } from '@/lib/integrations/gmail';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { threads: [], status: 'not_configured', error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const tokens = await getGoogleTokens(session.user.id);

  if (!tokens) {
    return NextResponse.json({
      threads: [],
      status: 'auth_error',
      error: 'Google account not linked or tokens expired',
    });
  }

  try {
    const threads = await fetchInboxThreads({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return NextResponse.json({
      threads,
      status: 'connected',
    });
  } catch (error) {
    console.error('Gmail API error:', error);
    return NextResponse.json({
      threads: [],
      status: 'api_error',
      error: 'Failed to fetch Gmail threads',
    });
  }
}

export async function POST() {
  return NextResponse.json({ ok: true });
}
