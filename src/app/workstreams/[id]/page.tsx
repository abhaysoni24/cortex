'use client';

import { use } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types & placeholder data
// ---------------------------------------------------------------------------

type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'waiting' | 'blocked' | 'done';

interface KanbanTask {
  id: string;
  title: string;
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  due?: string;
  subtasksDone?: number;
  subtasksTotal?: number;
}

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'inbox', label: 'Inbox' },
  { status: 'planned', label: 'Planned' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'waiting', label: 'Waiting' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'done', label: 'Done' },
];

const kanbanData: Record<TaskStatus, KanbanTask[]> = {
  inbox: [
    { id: 't1', title: 'Investigate conversion drop on /pricing', priority: 'p1', due: 'Mar 14' },
    { id: 't2', title: 'Add UTM tracking to newsletter', priority: 'p2' },
    { id: 't3', title: 'Review competitor landing pages', priority: 'p3', due: 'Mar 16' },
  ],
  planned: [
    { id: 't4', title: 'Build A/B test for hero CTA', priority: 'p0', due: 'Mar 12', subtasksDone: 1, subtasksTotal: 4 },
    { id: 't5', title: 'Set up BigQuery funnel views', priority: 'p1', due: 'Mar 13' },
    { id: 't6', title: 'Draft email drip sequence', priority: 'p2', due: 'Mar 15', subtasksDone: 0, subtasksTotal: 3 },
  ],
  in_progress: [
    { id: 't7', title: 'Ship onboarding flow v2', priority: 'p0', due: 'Today', subtasksDone: 2, subtasksTotal: 4 },
    { id: 't8', title: 'Implement GA4 event schema', priority: 'p1', due: 'Mar 12' },
    { id: 't9', title: 'Update pricing page copy', priority: 'p1', due: 'Today' },
    { id: 't10', title: 'Design referral flow mockups', priority: 'p2', due: 'Mar 14', subtasksDone: 3, subtasksTotal: 5 },
  ],
  waiting: [
    { id: 't11', title: 'Legal review for email campaigns', priority: 'p1', due: 'Mar 13' },
    { id: 't12', title: 'Design approval for landing page', priority: 'p2', due: 'Mar 14' },
    { id: 't13', title: 'API key from analytics vendor', priority: 'p3' },
  ],
  blocked: [
    { id: 't14', title: 'Deploy tracking pixel fix', priority: 'p0', due: 'Overdue' },
    { id: 't15', title: 'Migrate BigQuery dataset', priority: 'p1', due: 'Mar 15' },
    { id: 't16', title: 'SSO integration testing', priority: 'p2' },
  ],
  done: [
    { id: 't17', title: 'Launch newsletter signup widget', priority: 'p1' },
    { id: 't18', title: 'Set up Slack webhook alerts', priority: 'p2' },
    { id: 't19', title: 'Configure GA4 data stream', priority: 'p2' },
  ],
};

const priorityDotColor: Record<string, string> = {
  p0: 'bg-priority-p0',
  p1: 'bg-priority-p1',
  p2: 'bg-priority-p2',
  p3: 'bg-priority-p3',
};

type ViewTab = 'kanban' | 'tasks' | 'plan' | 'data';
const viewTabs: { key: ViewTab; label: string }[] = [
  { key: 'kanban', label: 'Kanban' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'plan', label: 'Plan' },
  { key: 'data', label: 'Data' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WorkstreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Derive a display name from the id
  const displayName = id.charAt(0).toUpperCase() + id.slice(1);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-status-success" />
          <h1 className="text-lg font-semibold text-text-primary">{displayName}</h1>
        </div>

        {/* View switcher */}
        <div className="flex items-center rounded-md border border-border-subtle bg-bg-surface">
          {viewTabs.map((tab) => (
            <button
              key={tab.key}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                tab.key === 'kanban'
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex flex-1 gap-3 overflow-x-auto p-4">
        {columns.map((col) => {
          const tasks = kanbanData[col.status];
          return (
            <div
              key={col.status}
              className="flex w-64 shrink-0 flex-col rounded-md border border-border-subtle bg-bg-base"
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    {col.label}
                  </h3>
                  <Badge>{tasks.length}</Badge>
                </div>
              </div>

              {/* Task list */}
              <div className="flex-1 space-y-2 overflow-y-auto p-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => console.log('open task detail', task.id)}
                    className="rounded-md border border-border-subtle bg-bg-surface p-3 transition-colors hover:bg-bg-elevated cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          'mt-1 h-2 w-2 shrink-0 rounded-full',
                          priorityDotColor[task.priority]
                        )}
                      />
                      <p className="text-sm font-medium text-text-primary leading-snug">
                        {task.title}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      {task.due && (
                        <span
                          className={cn(
                            'text-xs',
                            task.due === 'Overdue'
                              ? 'text-status-danger'
                              : 'text-text-tertiary'
                          )}
                        >
                          {task.due}
                        </span>
                      )}
                      {task.subtasksTotal != null && (
                        <span className="text-xs text-text-tertiary">
                          {task.subtasksDone}/{task.subtasksTotal}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add task button */}
              <div className="border-t border-border-subtle p-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-text-tertiary">
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
