import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getGoogleTokens } from '@/lib/auth/google-tokens';
import { fetchTodayEvents } from '@/lib/integrations/calendar';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { events: [], status: 'not_configured', error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const tokens = await getGoogleTokens(session.user.id);

  if (!tokens) {
    return NextResponse.json({
      events: [],
      status: 'auth_error',
      error: 'Google account not linked or tokens expired',
    });
  }

  try {
    const events = await fetchTodayEvents({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      calendarId: 'primary',
    });

    return NextResponse.json({
      events,
      status: 'connected',
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({
      events: [],
      status: 'api_error',
      error: 'Failed to fetch calendar events',
    });
  }
}

export async function POST() {
  return NextResponse.json({ status: 'sync_triggered' });
}
