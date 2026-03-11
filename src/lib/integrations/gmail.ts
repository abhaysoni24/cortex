/**
 * Gmail Integration
 *
 * Auth: OAuth 2.0 with Google API (Gmail scope)
 * Uses googleapis SDK with access tokens from NextAuth.
 */

import { google } from 'googleapis';

export interface GmailThread {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  labelIds: string[];
  messageCount: number;
}

export interface GmailConfig {
  accessToken: string;
  refreshToken: string;
}

/**
 * Fetch threads currently in the user's inbox.
 */
export async function fetchInboxThreads(
  config: GmailConfig,
  maxResults = 15
): Promise<GmailThread[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: config.accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  const listRes = await gmail.users.threads.list({
    userId: 'me',
    labelIds: ['INBOX'],
    maxResults,
  });

  const threadIds = listRes.data.threads ?? [];
  if (threadIds.length === 0) return [];

  const threads: GmailThread[] = [];

  for (const t of threadIds) {
    if (!t.id) continue;

    const threadRes = await gmail.users.threads.get({
      userId: 'me',
      id: t.id,
      format: 'METADATA',
      metadataHeaders: ['Subject', 'From', 'Date'],
    });

    const messages = threadRes.data.messages ?? [];
    const firstMsg = messages[0];
    if (!firstMsg) continue;

    const headers = firstMsg.payload?.headers ?? [];
    const subject =
      headers.find((h) => h.name === 'Subject')?.value ?? '(no subject)';
    const from = headers.find((h) => h.name === 'From')?.value ?? '';
    const date = headers.find((h) => h.name === 'Date')?.value ?? '';

    threads.push({
      id: t.id,
      subject,
      from,
      snippet: firstMsg.snippet ?? '',
      date,
      labelIds: firstMsg.labelIds ?? [],
      messageCount: messages.length,
    });
  }

  return threads;
}

/**
 * Fetch threads marked as important.
 */
export async function fetchImportantThreads(
  config: GmailConfig,
  maxResults = 10
): Promise<GmailThread[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: config.accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  const listRes = await gmail.users.threads.list({
    userId: 'me',
    labelIds: ['IMPORTANT'],
    maxResults,
  });

  const threadIds = listRes.data.threads ?? [];
  if (threadIds.length === 0) return [];

  const threads: GmailThread[] = [];

  for (const t of threadIds) {
    if (!t.id) continue;

    const threadRes = await gmail.users.threads.get({
      userId: 'me',
      id: t.id,
      format: 'METADATA',
      metadataHeaders: ['Subject', 'From', 'Date'],
    });

    const messages = threadRes.data.messages ?? [];
    const firstMsg = messages[0];
    if (!firstMsg) continue;

    const headers = firstMsg.payload?.headers ?? [];
    const subject =
      headers.find((h) => h.name === 'Subject')?.value ?? '(no subject)';
    const from = headers.find((h) => h.name === 'From')?.value ?? '';
    const date = headers.find((h) => h.name === 'Date')?.value ?? '';

    threads.push({
      id: t.id,
      subject,
      from,
      snippet: firstMsg.snippet ?? '',
      date,
      labelIds: firstMsg.labelIds ?? [],
      messageCount: messages.length,
    });
  }

  return threads;
}

/**
 * Convert a Gmail thread into a Cortex signal for the inner cortex queue.
 */
export async function convertToSignal(thread: GmailThread) {
  return {
    source: 'gmail' as const,
    external_id: thread.id,
    title: `Email: ${thread.subject}`,
    preview: thread.snippet.slice(0, 200),
    metadata: {
      subject: thread.subject,
      from: thread.from,
      date: thread.date,
      labelIds: thread.labelIds,
      messageCount: thread.messageCount,
    },
  };
}
