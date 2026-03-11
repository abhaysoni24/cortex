/**
 * HubSpot Integration
 *
 * Auth: API Key or OAuth 2.0
 * Sync: Periodic poll + webhook subscriptions
 * Entities: Deals, Contacts, Activities
 *
 * Capabilities:
 * - Pull: deals pipeline, contacts, recent activities
 * - Action: Link CRM records to tasks, surface deal context
 * - Display: CRM data within task detail and briefings
 */

export interface HubSpotConfig {
  apiKey: string;
}

export interface Deal {
  id: string;
  name: string;
  stage: string;
  amount: number;
  closeDate: string | null;
  ownerName: string;
  companyName: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  lastActivity: string | null;
}

export interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task';
  subject: string;
  body: string | null;
  timestamp: string;
  associatedDealId: string | null;
  associatedContactId: string | null;
}

/**
 * Fetch deals from the HubSpot pipeline.
 * Uses HubSpot CRM API deals endpoint with associations.
 */
export async function fetchDeals(config: HubSpotConfig): Promise<Deal[]> {
  // TODO: Implement HubSpot API call to fetch deals
  // Uses GET /crm/v3/objects/deals with properties and associations
  console.log('HubSpot: fetchDeals not yet implemented');
  return [];
}

/**
 * Fetch contacts from HubSpot CRM.
 * Uses HubSpot CRM API contacts endpoint.
 */
export async function fetchContacts(config: HubSpotConfig): Promise<Contact[]> {
  // TODO: Implement HubSpot API call to fetch contacts
  // Uses GET /crm/v3/objects/contacts with properties
  console.log('HubSpot: fetchContacts not yet implemented');
  return [];
}

/**
 * Fetch recent CRM activities (emails, calls, meetings, notes).
 * Useful for surfacing context in briefings and task preparation.
 */
export async function fetchRecentActivities(config: HubSpotConfig): Promise<Activity[]> {
  // TODO: Implement HubSpot API call to fetch recent engagements
  // Uses GET /crm/v3/objects/engagements or timeline API
  console.log('HubSpot: fetchRecentActivities not yet implemented');
  return [];
}
