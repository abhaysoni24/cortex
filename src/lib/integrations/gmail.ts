/**
 * Gmail Integration
 *
 * Auth: OAuth 2.0 with Google API (Gmail scope)
 * Sync: Webhook (push notifications via Pub/Sub) + periodic poll
 * Entities: Email threads in inbox, important/starred
 *
 * Capabilities:
 * - Pull: inbox threads, important threads, starred
 * - Action: Convert thread -> task, link thread to task
 * - Display: Email context within task detail
 */

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
 * Uses Gmail API threads.list with labelIds=INBOX.
 */
export async function fetchInboxThreads(config: GmailConfig): Promise<GmailThread[]> {
  // TODO: Implement Gmail API call to fetch inbox threads
  // Uses threads.list with labelIds=INBOX, then threads.get for details
  console.log('Gmail: fetchInboxThreads not yet implemented');
  return [];
}

/**
 * Fetch threads marked as important by Gmail's priority model.
 * Uses Gmail API threads.list with labelIds=IMPORTANT.
 */
export async function fetchImportantThreads(config: GmailConfig): Promise<GmailThread[]> {
  // TODO: Implement Gmail API call to fetch important threads
  // Uses threads.list with labelIds=IMPORTANT
  console.log('Gmail: fetchImportantThreads not yet implemented');
  return [];
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
