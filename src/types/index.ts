import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type {
  workstreams,
  tasks,
  taskDependencies,
  tags,
  taskTags,
  taskLinks,
  incomingSignals,
  calendarEvents,
  dataQueries,
  assistantBriefings,
  activityLog,
} from '@/lib/db/schema';

// ---------------------------------------------------------------------------
// Select types (rows returned from the database)
// ---------------------------------------------------------------------------

export type Workstream = InferSelectModel<typeof workstreams>;
export type Task = InferSelectModel<typeof tasks>;
export type TaskDependency = InferSelectModel<typeof taskDependencies>;
export type Tag = InferSelectModel<typeof tags>;
export type TaskTag = InferSelectModel<typeof taskTags>;
export type TaskLink = InferSelectModel<typeof taskLinks>;
export type IncomingSignal = InferSelectModel<typeof incomingSignals>;
export type CalendarEvent = InferSelectModel<typeof calendarEvents>;
export type DataQuery = InferSelectModel<typeof dataQueries>;
export type AssistantBriefing = InferSelectModel<typeof assistantBriefings>;
export type ActivityLogEntry = InferSelectModel<typeof activityLog>;

// ---------------------------------------------------------------------------
// Insert types (data required to create a new row)
// ---------------------------------------------------------------------------

export type NewWorkstream = InferInsertModel<typeof workstreams>;
export type NewTask = InferInsertModel<typeof tasks>;
export type NewTaskDependency = InferInsertModel<typeof taskDependencies>;
export type NewTag = InferInsertModel<typeof tags>;
export type NewTaskTag = InferInsertModel<typeof taskTags>;
export type NewTaskLink = InferInsertModel<typeof taskLinks>;
export type NewIncomingSignal = InferInsertModel<typeof incomingSignals>;
export type NewCalendarEvent = InferInsertModel<typeof calendarEvents>;
export type NewDataQuery = InferInsertModel<typeof dataQueries>;
export type NewAssistantBriefing = InferInsertModel<typeof assistantBriefings>;
export type NewActivityLogEntry = InferInsertModel<typeof activityLog>;

// ---------------------------------------------------------------------------
// Enum union types
// ---------------------------------------------------------------------------

export type WorkstreamStatus = 'active' | 'archived';

export type TaskStatus =
  | 'inbox'
  | 'planned'
  | 'in_progress'
  | 'waiting'
  | 'blocked'
  | 'done';

export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3';

export type CortexCategory =
  | 'inbox'
  | 'triage'
  | 'idea'
  | 'assistant_suggestion';

export type SourceType = 'manual' | 'slack' | 'gmail' | 'calendar' | 'assistant';

export type DependencyType = 'blocks' | 'related';

export type LinkType =
  | 'slack_message'
  | 'gmail_thread'
  | 'calendar_event'
  | 'data_query'
  | 'url';

export type SignalSource = 'slack' | 'gmail' | 'calendar';

export type SignalStatus = 'pending' | 'converted' | 'dismissed' | 'deferred';

export type DataQuerySource = 'bigquery' | 'hubspot' | 'ga4';

// ---------------------------------------------------------------------------
// UI / View types
// ---------------------------------------------------------------------------

export type ViewType = 'kanban' | 'list' | 'plan' | 'agenda' | 'data';

// ---------------------------------------------------------------------------
// Composite types (tasks with relations loaded)
// ---------------------------------------------------------------------------

export type TaskWithRelations = Task & {
  workstream?: Workstream | null;
  subtasks?: Task[];
  parentTask?: Task | null;
  tags?: (TaskTag & { tag: Tag })[];
  links?: TaskLink[];
};

export type CalendarEventWithTasks = CalendarEvent & {
  prepTask?: Task | null;
  followupTask?: Task | null;
};

export type IncomingSignalWithRelations = IncomingSignal & {
  suggestedWorkstream?: Workstream | null;
  task?: Task | null;
};
