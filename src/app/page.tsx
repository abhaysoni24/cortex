'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  MessageSquare,
  Mail,
  Calendar,
  ArrowRight,
  X,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewTaskDialog } from '@/components/tasks/new-task-dialog';
import type { Task } from '@/stores/task-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Workstream {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

// Placeholder schedule data (calendar integration is separate)
const schedule = [
  { time: '9:00 AM', title: 'Daily standup', duration: '15m' },
  { time: '10:00 AM', title: 'Growth strategy sync', duration: '45m' },
  { time: '11:30 AM', title: 'Deep work block', duration: '90m', isBlock: true },
  { time: '2:00 PM', title: '1:1 with Sarah (Eng)', duration: '30m' },
  { time: '3:30 PM', title: 'Product review', duration: '60m' },
];

// ---------------------------------------------------------------------------
// Priority dot helper
// ---------------------------------------------------------------------------

const priorityDotColor: Record<string, string> = {
  p0: 'bg-priority-p0',
  p1: 'bg-priority-p1',
  p2: 'bg-priority-p2',
  p3: 'bg-priority-p3',
};

const sourceIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  slack: MessageSquare,
  gmail: Mail,
  calendar: Calendar,
};

// ---------------------------------------------------------------------------
// Format date helper
// ---------------------------------------------------------------------------

function formatDueDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommandCenterPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDefaultTitle, setDialogDefaultTitle] = useState('');

  // -------------------------------------------------------------------------
  // Fetch data
  // -------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, wsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/workstreams'),
      ]);
      if (tasksRes.ok) {
        const tasks: Task[] = await tasksRes.json();
        setAllTasks(tasks);
      }
      if (wsRes.ok) {
        const ws: Workstream[] = await wsRes.json();
        setWorkstreams(ws);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  // Priority stack: top 5 non-done tasks sorted by priority
  const priorityTasks = allTasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const order = { p0: 0, p1: 1, p2: 2, p3: 3 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 5);

  // Incoming signals (cortex inbox items from external sources)
  const signals = allTasks
    .filter(
      (t) =>
        t.is_cortex_item &&
        t.status !== 'done' &&
        t.source_type !== 'manual'
    )
    .slice(0, 4);

  // Overdue tasks
  const now = new Date();
  const overdueItems = allTasks.filter((t) => {
    if (t.status === 'done' || !t.due_date) return false;
    return new Date(t.due_date) < now;
  });

  // Blocked tasks
  const blockedItems = allTasks.filter((t) => t.status === 'blocked');

  // Workstream health: calculate progress as % of tasks done
  const workstreamHealth = workstreams.map((ws) => {
    const wsTasks = allTasks.filter((t) => t.workstream_id === ws.id);
    const totalTasks = wsTasks.length;
    const doneTasks = wsTasks.filter((t) => t.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    return { ...ws, progress, totalTasks };
  });

  // Summary stats
  const todayTasks = allTasks.filter((t) => {
    if (t.status === 'done') return false;
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  // -------------------------------------------------------------------------
  // Signal action handler
  // -------------------------------------------------------------------------

  const handleSignalToTask = (signal: Task) => {
    setDialogDefaultTitle(signal.title);
    setDialogOpen(true);
  };

  const handleDismissSignal = async (signal: Task) => {
    try {
      await fetch(`/api/tasks/${signal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      });
      setAllTasks((prev) => prev.filter((t) => t.id !== signal.id));
    } catch (err) {
      console.error('Failed to dismiss signal:', err);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-bg-elevated" />
        <div className="h-16 animate-pulse rounded-md bg-bg-elevated" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 animate-pulse rounded-md bg-bg-elevated" />
          <div className="h-48 animate-pulse rounded-md bg-bg-elevated" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Page header */}
      <h1 className="text-lg font-semibold text-text-primary">Command Center</h1>

      {/* Daily Briefing */}
      <div className="rounded-md border border-border-subtle border-l-2 border-l-accent-500 bg-bg-surface p-4">
        <p className="text-sm text-text-secondary">
          Good morning.{' '}
          <span className="text-text-primary font-medium">
            {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}
          </span>{' '}
          due today,{' '}
          <span className="text-text-primary font-medium">
            {priorityTasks.length} active
          </span>
          {overdueItems.length > 0 && (
            <>
              ,{' '}
              <span className="text-status-danger font-medium">
                {overdueItems.length} overdue
              </span>
            </>
          )}
          {blockedItems.length > 0 && (
            <>
              ,{' '}
              <span className="text-status-danger font-medium">
                {blockedItems.length} blocker{blockedItems.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
          .
        </p>
      </div>

      {/* Middle row: Priority Stack + Calendar Strip */}
      <div className="grid grid-cols-2 gap-4">
        {/* Priority Stack */}
        <div className="rounded-md border border-border-subtle bg-bg-surface p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Priority Stack
          </h2>
          <div className="space-y-2">
            {priorityTasks.length === 0 && (
              <p className="text-xs text-text-tertiary py-2">
                No active tasks
              </p>
            )}
            {priorityTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-bg-elevated cursor-pointer"
              >
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    priorityDotColor[task.priority]
                  )}
                />
                <span className="flex-1 truncate text-sm text-text-primary">
                  {task.title}
                </span>
                <span className="shrink-0 text-xs text-text-tertiary">
                  {formatDueDate(task.due_date) ?? '--'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Strip */}
        <div className="rounded-md border border-border-subtle bg-bg-surface p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Today&apos;s Schedule
          </h2>
          <div className="space-y-2">
            {schedule.map((slot, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-3 rounded-md px-2 py-1.5 transition-colors',
                  slot.isBlock
                    ? 'border border-dashed border-border-default bg-bg-elevated/50'
                    : 'hover:bg-bg-elevated'
                )}
              >
                <span className="w-16 shrink-0 text-xs font-mono text-text-tertiary">
                  {slot.time}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{slot.title}</p>
                  <p className="text-xs text-text-tertiary">{slot.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Incoming Signals + Workstream Health */}
      <div className="grid grid-cols-2 gap-4">
        {/* Incoming Signals */}
        <div className="rounded-md border border-border-subtle bg-bg-surface p-4">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Incoming Signals
            </h2>
            {signals.length > 0 && (
              <Badge variant="status-warning">{signals.length}</Badge>
            )}
          </div>
          <div className="space-y-2">
            {signals.length === 0 && (
              <p className="text-xs text-text-tertiary py-2">
                No incoming signals
              </p>
            )}
            {signals.map((signal) => {
              const SourceIcon = sourceIcon[signal.source_type] ?? MessageSquare;
              return (
                <div
                  key={signal.id}
                  className="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-bg-elevated"
                >
                  <SourceIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-secondary">
                        {signal.source_type}
                      </span>
                      <span className="text-[10px] text-text-tertiary">
                        {new Date(signal.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-text-primary">
                      {signal.title}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSignalToTask(signal)}
                    >
                      <ArrowRight className="h-3 w-3" />
                      Task
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissSignal(signal)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workstream Health */}
        <div className="rounded-md border border-border-subtle bg-bg-surface p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Workstreams
          </h2>
          <div className="space-y-3">
            {workstreamHealth.length === 0 && (
              <p className="text-xs text-text-tertiary py-2">
                No workstreams yet
              </p>
            )}
            {workstreamHealth.map((ws) => {
              const colorStyle = ws.color?.startsWith('#')
                ? { backgroundColor: ws.color }
                : undefined;
              const colorClass =
                ws.color && !ws.color.startsWith('#') ? ws.color : 'bg-accent-500';
              return (
                <div key={ws.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn('h-2 w-2 rounded-full', colorStyle ? '' : colorClass)}
                        style={colorStyle}
                      />
                      <span className="text-sm text-text-primary">{ws.name}</span>
                    </div>
                    <span className="text-xs font-mono text-text-tertiary">
                      {ws.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
                    <div
                      className={cn('h-full rounded-full', colorStyle ? '' : colorClass)}
                      style={{
                        width: `${ws.progress}%`,
                        ...(colorStyle ?? {}),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extra row: Overdue + Blocked */}
      <div className="grid grid-cols-2 gap-4">
        {/* Overdue */}
        <div className="rounded-md border border-border-subtle border-l-2 border-l-status-danger bg-bg-surface p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-danger" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-status-danger">
              Overdue
            </h2>
          </div>
          <div className="space-y-2">
            {overdueItems.length === 0 && (
              <p className="text-xs text-text-tertiary py-2">All clear</p>
            )}
            {overdueItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-bg-elevated cursor-pointer"
              >
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    priorityDotColor[item.priority]
                  )}
                />
                <span className="flex-1 truncate text-sm text-text-primary">
                  {item.title}
                </span>
                <span className="shrink-0 text-xs text-status-danger">
                  {formatDueDate(item.due_date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked */}
        <div className="rounded-md border border-border-subtle border-l-2 border-l-status-danger bg-bg-surface p-4">
          <div className="mb-3 flex items-center gap-2">
            <Ban className="h-4 w-4 text-status-danger" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-status-danger">
              Blocked
            </h2>
          </div>
          <div className="space-y-2">
            {blockedItems.length === 0 && (
              <p className="text-xs text-text-tertiary py-2">No blockers</p>
            )}
            {blockedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-bg-elevated cursor-pointer"
              >
                <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-danger" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-text-tertiary line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Task Dialog */}
      <NewTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => fetchData()}
        defaultTitle={dialogDefaultTitle}
        workstreams={workstreams}
      />
    </div>
  );
}
