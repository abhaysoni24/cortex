'use client';

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

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

const priorityTasks = [
  { id: '1', title: 'Ship onboarding flow v2', due: 'Today', priority: 'p0' as const },
  { id: '2', title: 'Review GA4 funnel drop-off', due: 'Today', priority: 'p0' as const },
  { id: '3', title: 'Prepare board deck slides', due: 'Tomorrow', priority: 'p1' as const },
  { id: '4', title: 'Write Q1 growth retrospective', due: 'Mar 13', priority: 'p1' as const },
  { id: '5', title: 'Update design system tokens', due: 'Mar 14', priority: 'p2' as const },
];

const schedule = [
  { time: '9:00 AM', title: 'Daily standup', duration: '15m' },
  { time: '10:00 AM', title: 'Growth strategy sync', duration: '45m' },
  { time: '11:30 AM', title: 'Deep work block', duration: '90m', isBlock: true },
  { time: '2:00 PM', title: '1:1 with Sarah (Eng)', duration: '30m' },
  { time: '3:30 PM', title: 'Product review', duration: '60m' },
];

const signals = [
  {
    id: '1',
    source: 'slack' as const,
    channel: '#growth',
    preview: 'Alex: "Can we move the A/B test launch to Thursday?"',
    time: '12m ago',
  },
  {
    id: '2',
    source: 'gmail' as const,
    channel: 'Investor update',
    preview: 'Draft review needed for Q1 investor letter',
    time: '34m ago',
  },
  {
    id: '3',
    source: 'calendar' as const,
    channel: 'Calendar',
    preview: 'Board meeting moved to Friday 3 PM',
    time: '1h ago',
  },
  {
    id: '4',
    source: 'slack' as const,
    channel: '#platform',
    preview: 'Deploy pipeline failing on staging — needs attention',
    time: '2h ago',
  },
];

const workstreams = [
  { name: 'Growth', color: 'bg-status-success', progress: 72 },
  { name: 'Platform', color: 'bg-status-info', progress: 45 },
  { name: 'Analytics', color: 'bg-accent-500', progress: 88 },
  { name: 'Design System', color: 'bg-purple-500', progress: 31 },
];

const overdueItems = [
  { id: 'o1', title: 'Finalize pricing page copy', due: '2 days ago', priority: 'p1' as const },
  { id: 'o2', title: 'Deploy tracking pixel fix', due: '1 day ago', priority: 'p0' as const },
];

const blockedItems = [
  { id: 'b1', title: 'Launch email drip campaign', blocker: 'Waiting on legal review' },
  { id: 'b2', title: 'Migrate BigQuery dataset', blocker: 'Blocked by infra team' },
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
// Component
// ---------------------------------------------------------------------------

export default function CommandCenterPage() {
  return (
    <div className="space-y-4 p-6">
      {/* Page header */}
      <h1 className="text-lg font-semibold text-text-primary">Command Center</h1>

      {/* Daily Briefing — full width */}
      <div className="rounded-md border border-border-subtle border-l-2 border-l-accent-500 bg-bg-surface p-4">
        <p className="text-sm text-text-secondary">
          Good morning. <span className="text-text-primary font-medium">7 tasks</span> today,{' '}
          <span className="text-text-primary font-medium">3 meetings</span>,{' '}
          <span className="text-status-danger font-medium">2 blockers</span>.
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
                <span className="shrink-0 text-xs text-text-tertiary">{task.due}</span>
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
            <Badge variant="status-warning">{signals.length}</Badge>
          </div>
          <div className="space-y-2">
            {signals.map((signal) => {
              const SourceIcon = sourceIcon[signal.source];
              return (
                <div
                  key={signal.id}
                  className="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-bg-elevated"
                >
                  <SourceIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-secondary">
                        {signal.channel}
                      </span>
                      <span className="text-[10px] text-text-tertiary">{signal.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-text-primary">
                      {signal.preview}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-3 w-3" />
                      Task
                    </Button>
                    <Button variant="ghost" size="sm">
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
            {workstreams.map((ws) => (
              <div key={ws.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', ws.color)} />
                    <span className="text-sm text-text-primary">{ws.name}</span>
                  </div>
                  <span className="text-xs font-mono text-text-tertiary">{ws.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className={cn('h-full rounded-full', ws.color)}
                    style={{ width: `${ws.progress}%` }}
                  />
                </div>
              </div>
            ))}
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
                <span className="shrink-0 text-xs text-status-danger">{item.due}</span>
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
            {blockedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-bg-elevated cursor-pointer"
              >
                <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-danger" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-tertiary">{item.blocker}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
