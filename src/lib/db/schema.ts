import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const workstreamStatusEnum = pgEnum('workstream_status', [
  'active',
  'archived',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'inbox',
  'planned',
  'in_progress',
  'waiting',
  'blocked',
  'done',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'p0',
  'p1',
  'p2',
  'p3',
]);

export const cortexCategoryEnum = pgEnum('cortex_category', [
  'inbox',
  'triage',
  'idea',
  'assistant_suggestion',
]);

export const sourceTypeEnum = pgEnum('source_type', [
  'manual',
  'slack',
  'gmail',
  'calendar',
  'assistant',
]);

export const dependencyTypeEnum = pgEnum('dependency_type', [
  'blocks',
  'related',
]);

export const linkTypeEnum = pgEnum('link_type', [
  'slack_message',
  'gmail_thread',
  'calendar_event',
  'data_query',
  'url',
]);

export const signalSourceEnum = pgEnum('signal_source', [
  'slack',
  'gmail',
  'calendar',
]);

export const signalStatusEnum = pgEnum('signal_status', [
  'pending',
  'converted',
  'dismissed',
  'deferred',
]);

export const dataQuerySourceEnum = pgEnum('data_query_source', [
  'bigquery',
  'hubspot',
  'ga4',
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const workstreams = pgTable('workstreams', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  color: varchar('color', { length: 32 }),
  icon: varchar('icon', { length: 64 }),
  description: text('description'),
  status: workstreamStatusEnum('status').notNull().default('active'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tasks = pgTable('tasks', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  workstreamId: uuid('workstream_id').references(() => workstreams.id, {
    onDelete: 'set null',
  }),
  parentTaskId: uuid('parent_task_id').references((): any => tasks.id, {
    onDelete: 'cascade',
  }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('inbox'),
  priority: taskPriorityEnum('priority').notNull().default('p2'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  sortOrder: integer('sort_order').notNull().default(0),
  isCortexItem: boolean('is_cortex_item').notNull().default(false),
  cortexCategory: cortexCategoryEnum('cortex_category'),
  sourceType: sourceTypeEnum('source_type').notNull().default('manual'),
  sourceReferenceId: varchar('source_reference_id', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const taskDependencies = pgTable('task_dependencies', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  dependsOnTaskId: uuid('depends_on_task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  dependencyType: dependencyTypeEnum('dependency_type')
    .notNull()
    .default('blocks'),
});

export const tags = pgTable('tags', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull().unique(),
  color: varchar('color', { length: 32 }),
});

export const taskTags = pgTable('task_tags', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
});

export const taskLinks = pgTable('task_links', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  linkType: linkTypeEnum('link_type').notNull(),
  externalId: varchar('external_id', { length: 500 }),
  title: varchar('title', { length: 500 }),
  url: text('url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const incomingSignals = pgTable('incoming_signals', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  source: signalSourceEnum('source').notNull(),
  externalId: varchar('external_id', { length: 500 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  preview: text('preview'),
  metadata: jsonb('metadata'),
  status: signalStatusEnum('status').notNull().default('pending'),
  suggestedAction: text('suggested_action'),
  suggestedWorkstreamId: uuid('suggested_workstream_id').references(
    () => workstreams.id,
    { onDelete: 'set null' }
  ),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  externalId: varchar('external_id', { length: 500 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 500 }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  attendees: jsonb('attendees'),
  hasPrep: boolean('has_prep').notNull().default(false),
  hasFollowup: boolean('has_followup').notNull().default(false),
  prepTaskId: uuid('prep_task_id').references(() => tasks.id, {
    onDelete: 'set null',
  }),
  followupTaskId: uuid('followup_task_id').references(() => tasks.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const dataQueries = pgTable('data_queries', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  source: dataQuerySourceEnum('source').notNull(),
  queryConfig: jsonb('query_config').notNull(),
  workstreamId: uuid('workstream_id').references(() => workstreams.id, {
    onDelete: 'set null',
  }),
  isPinned: boolean('is_pinned').notNull().default(false),
  lastResult: jsonb('last_result'),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const assistantBriefings = pgTable('assistant_briefings', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  date: date('date').notNull().unique(),
  content: jsonb('content').notNull(),
  priorityTasks: jsonb('priority_tasks'),
  blockers: jsonb('blockers'),
  incomingSummary: text('incoming_summary'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const activityLog = pgTable('activity_log', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const workstreamsRelations = relations(workstreams, ({ many }) => ({
  tasks: many(tasks),
  dataQueries: many(dataQueries),
  suggestedSignals: many(incomingSignals),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  workstream: one(workstreams, {
    fields: [tasks.workstreamId],
    references: [workstreams.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: 'subtasks',
  }),
  subtasks: many(tasks, { relationName: 'subtasks' }),
  dependencies: many(taskDependencies, { relationName: 'taskDependencies' }),
  dependents: many(taskDependencies, { relationName: 'dependsOnDependencies' }),
  tags: many(taskTags),
  links: many(taskLinks),
  signals: many(incomingSignals),
  prepForEvents: many(calendarEvents, { relationName: 'prepTask' }),
  followupForEvents: many(calendarEvents, { relationName: 'followupTask' }),
}));

export const taskDependenciesRelations = relations(
  taskDependencies,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskDependencies.taskId],
      references: [tasks.id],
      relationName: 'taskDependencies',
    }),
    dependsOn: one(tasks, {
      fields: [taskDependencies.dependsOnTaskId],
      references: [tasks.id],
      relationName: 'dependsOnDependencies',
    }),
  })
);

export const tagsRelations = relations(tags, ({ many }) => ({
  taskTags: many(taskTags),
}));

export const taskTagsRelations = relations(taskTags, ({ one }) => ({
  task: one(tasks, {
    fields: [taskTags.taskId],
    references: [tasks.id],
  }),
  tag: one(tags, {
    fields: [taskTags.tagId],
    references: [tags.id],
  }),
}));

export const taskLinksRelations = relations(taskLinks, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLinks.taskId],
    references: [tasks.id],
  }),
}));

export const incomingSignalsRelations = relations(
  incomingSignals,
  ({ one }) => ({
    suggestedWorkstream: one(workstreams, {
      fields: [incomingSignals.suggestedWorkstreamId],
      references: [workstreams.id],
    }),
    task: one(tasks, {
      fields: [incomingSignals.taskId],
      references: [tasks.id],
    }),
  })
);

export const calendarEventsRelations = relations(
  calendarEvents,
  ({ one }) => ({
    prepTask: one(tasks, {
      fields: [calendarEvents.prepTaskId],
      references: [tasks.id],
      relationName: 'prepTask',
    }),
    followupTask: one(tasks, {
      fields: [calendarEvents.followupTaskId],
      references: [tasks.id],
      relationName: 'followupTask',
    }),
  })
);

export const dataQueriesRelations = relations(dataQueries, ({ one }) => ({
  workstream: one(workstreams, {
    fields: [dataQueries.workstreamId],
    references: [workstreams.id],
  }),
}));
