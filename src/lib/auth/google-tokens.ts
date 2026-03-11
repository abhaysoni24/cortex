import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Get valid Google OAuth tokens for the authenticated user.
 * Refreshes the access token if expired.
 */
export async function getGoogleTokens(userId: string): Promise<GoogleTokens | null> {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')))
    .limit(1);

  if (!account?.access_token || !account?.refresh_token) {
    return null;
  }

  // Check if token is expired (with 5 min buffer)
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at < now + 300) {
    // Refresh the token
    const refreshed = await refreshAccessToken(account.refresh_token);
    if (!refreshed) return null;

    // Update in DB
    await db
      .update(accounts)
      .set({
        access_token: refreshed.access_token,
        expires_at: refreshed.expires_at,
      })
      .where(
        and(eq(accounts.userId, userId), eq(accounts.provider, 'google'))
      );

    return {
      accessToken: refreshed.access_token,
      refreshToken: account.refresh_token,
    };
  }

  return {
    accessToken: account.access_token,
    refreshToken: account.refresh_token,
  };
}

async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_at: number } | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Failed to refresh Google token:', data);
      return null;
    }

    return {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    };
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return null;
  }
}
