/**
 * Google Calendar Integration
 *
 * Auth: OAuth 2.0 with Google API (Calendar scope)
 * Uses googleapis SDK with access tokens from NextAuth.
 */

import { google } from 'googleapis';

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string;
  attendees: string[];
  htmlLink: string;
}

export interface CalendarConfig {
  accessToken: string;
  refreshToken: string;
  calendarId: string;
}

/**
 * Fetch all events for the current day.
 */
export async function fetchTodayEvents(
  config: CalendarConfig
): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  return fetchEventsBetween(config, startOfDay, endOfDay);
}

/**
 * Fetch upcoming events within the specified number of days.
 */
export async function fetchUpcomingEvents(
  config: CalendarConfig,
  days: number = 7
): Promise<CalendarEvent[]> {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return fetchEventsBetween(config, now, future);
}

async function fetchEventsBetween(
  config: CalendarConfig,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: config.accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  const res = await calendar.events.list({
    calendarId: config.calendarId || 'primary',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 50,
  });

  const items = res.data.items ?? [];

  return items.map((event) => ({
    id: event.id ?? '',
    summary: event.summary ?? '(No title)',
    description: event.description ?? null,
    location: event.location ?? null,
    start: event.start?.dateTime ?? event.start?.date ?? '',
    end: event.end?.dateTime ?? event.end?.date ?? '',
    attendees: (event.attendees ?? [])
      .map((a) => a.email)
      .filter(Boolean) as string[],
    htmlLink: event.htmlLink ?? '',
  }));
}

/**
 * Convert a calendar event into a Cortex signal for the inner cortex queue.
 */
export async function convertToSignal(event: CalendarEvent) {
  return {
    source: 'calendar' as const,
    external_id: event.id,
    title: `Meeting: ${event.summary}`,
    preview:
      event.description?.slice(0, 200) ??
      `${event.summary} at ${event.start}`,
    metadata: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      attendees: event.attendees,
      htmlLink: event.htmlLink,
    },
  };
}

/**
 * Generate suggested prep tasks for a meeting based on its metadata.
 */
export async function generatePrepSuggestions(
  event: CalendarEvent
): Promise<string[]> {
  const suggestions: string[] = [];

  if (event.attendees.length > 0) {
    suggestions.push(
      `Review context for ${event.attendees.length} attendee(s)`
    );
  }

  if (event.description) {
    suggestions.push('Review meeting agenda and attached documents');
  }

  if (event.summary.toLowerCase().includes('review')) {
    suggestions.push('Prepare status update and key metrics');
  }

  if (
    event.summary.toLowerCase().includes('1:1') ||
    event.summary.toLowerCase().includes('1-on-1')
  ) {
    suggestions.push('Review action items from last 1:1');
    suggestions.push('Prepare discussion topics and blockers');
  }

  if (
    event.summary.toLowerCase().includes('standup') ||
    event.summary.toLowerCase().includes('stand-up')
  ) {
    suggestions.push('Prepare yesterday/today/blockers update');
  }

  if (suggestions.length === 0) {
    suggestions.push('Review any related tasks before the meeting');
  }

  return suggestions;
}
