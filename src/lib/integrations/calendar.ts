/**
 * Google Calendar Integration
 *
 * Auth: OAuth 2.0 with Google API (Calendar scope)
 * Sync: Webhook (push notifications) + periodic poll
 * Entities: Calendar events for today and upcoming
 *
 * Capabilities:
 * - Pull: today's events, upcoming events
 * - Action: Generate meeting prep tasks, link events to tasks
 * - Display: Calendar context within task detail and briefings
 */

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
 * Uses Calendar API events.list with timeMin/timeMax set to today's boundaries.
 */
export async function fetchTodayEvents(config: CalendarConfig): Promise<CalendarEvent[]> {
  // TODO: Implement Google Calendar API call to fetch today's events
  // Uses events.list with timeMin=start of day, timeMax=end of day
  console.log('Calendar: fetchTodayEvents not yet implemented');
  return [];
}

/**
 * Fetch upcoming events within the specified number of days.
 * @param config - Calendar configuration with auth tokens
 * @param days - Number of days ahead to look (default: 7)
 */
export async function fetchUpcomingEvents(
  config: CalendarConfig,
  days: number = 7
): Promise<CalendarEvent[]> {
  // TODO: Implement Google Calendar API call to fetch upcoming events
  // Uses events.list with timeMin=now, timeMax=now+days
  console.log(`Calendar: fetchUpcomingEvents (${days} days) not yet implemented`);
  return [];
}

/**
 * Convert a calendar event into a Cortex signal for the inner cortex queue.
 */
export async function convertToSignal(event: CalendarEvent) {
  return {
    source: 'calendar' as const,
    external_id: event.id,
    title: `Meeting: ${event.summary}`,
    preview: event.description?.slice(0, 200) ?? `${event.summary} at ${event.start}`,
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
 *
 * Uses heuristics (and eventually LLM) to suggest actions like:
 * - Review agenda / shared docs
 * - Pull relevant data from integrations (HubSpot, BigQuery, etc.)
 * - Prepare talking points based on attendee context
 *
 * @param event - The calendar event to generate prep suggestions for
 * @returns Array of suggested prep task descriptions
 */
export async function generatePrepSuggestions(event: CalendarEvent): Promise<string[]> {
  // TODO: Implement with LLM or rule-based logic
  // For MVP, return basic heuristic suggestions

  const suggestions: string[] = [];

  if (event.attendees.length > 0) {
    suggestions.push(`Review context for ${event.attendees.length} attendee(s)`);
  }

  if (event.description) {
    suggestions.push('Review meeting agenda and attached documents');
  }

  if (event.summary.toLowerCase().includes('review')) {
    suggestions.push('Prepare status update and key metrics');
  }

  if (event.summary.toLowerCase().includes('1:1') || event.summary.toLowerCase().includes('1-on-1')) {
    suggestions.push('Review action items from last 1:1');
    suggestions.push('Prepare discussion topics and blockers');
  }

  if (event.summary.toLowerCase().includes('standup') || event.summary.toLowerCase().includes('stand-up')) {
    suggestions.push('Prepare yesterday/today/blockers update');
  }

  if (suggestions.length === 0) {
    suggestions.push('Review any related tasks before the meeting');
  }

  return suggestions;
}
