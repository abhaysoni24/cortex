/**
 * Slack Integration
 *
 * Auth: OAuth 2.0 with Slack API
 * Sync: Webhook (Events API) + periodic poll
 * Entities: Messages where user is mentioned or DM'd
 *
 * Capabilities:
 * - Pull: mentions, DMs, reactions
 * - Action: Convert message -> task, link message to task
 * - Display: Slack context within task detail
 */

export interface SlackMessage {
  id: string;
  channel: string;
  channelName: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  permalink: string;
}

export interface SlackConfig {
  clientId: string;
  clientSecret: string;
  signingSecret: string;
  accessToken?: string;
  teamId?: string;
}

export async function fetchMentions(config: SlackConfig): Promise<SlackMessage[]> {
  // TODO: Implement Slack API call to fetch mentions
  // Uses conversations.history + search.messages
  console.log('Slack: fetchMentions not yet implemented');
  return [];
}

export async function fetchDirectMessages(config: SlackConfig): Promise<SlackMessage[]> {
  // TODO: Implement Slack API call to fetch DMs
  console.log('Slack: fetchDirectMessages not yet implemented');
  return [];
}

export async function convertToSignal(message: SlackMessage) {
  return {
    source: 'slack' as const,
    external_id: message.id,
    title: `Slack: ${message.userName} in #${message.channelName}`,
    preview: message.text.slice(0, 200),
    metadata: {
      channel: message.channel,
      channelName: message.channelName,
      userId: message.userId,
      userName: message.userName,
      permalink: message.permalink,
      timestamp: message.timestamp,
    },
  };
}
