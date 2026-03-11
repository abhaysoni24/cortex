'use client';

import {
  Brain,
  MessageSquare,
  Mail,
  Calendar,
  Lightbulb,
  ArrowRight,
  Archive,
  Plus,
  Inbox,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

interface CortexItem {
  id: string;
  title: string;
  preview: string;
  source?: 'slack' | 'gmail' | 'calendar' | 'manual';
  time: string;
}

const inboxItems: CortexItem[] = [
  {
    id: 'c1',
    title: 'Slack: Alex in #growth',
    preview: 'Can we move the A/B test launch to Thursday? The creative assets are delayed.',
    source: 'slack',
    time: '12m ago',
  },
  {
    id: 'c2',
    title: 'Gmail: Q1 Investor Letter',
    preview: 'Draft review needed for the quarterly investor update before Friday.',
    source: 'gmail',
    time: '34m ago',
  },
  {
    id: 'c3',
    title: 'Calendar: Board meeting moved',
    preview: 'Board meeting rescheduled to Friday 3 PM. Deck needs updating.',
    source: 'calendar',
    time: '1h ago',
  },
  {
    id: 'c4',
    title: 'Slack: Deploy pipeline failing',
    preview: 'Staging deploy is broken — CI/CD timeout on integration tests.',
    source: 'slack',
    time: '2h ago',
  },
];

const triageItems: CortexItem[] = [
  {
    id: 'c5',
    title: 'Investigate pricing page drop-off',
    preview: 'GA4 shows 23% drop in /pricing conversion. Need to dig into segment data.',
    source: 'manual',
    time: '3h ago',
  },
  {
    id: 'c6',
    title: 'Follow up with Sarah on API docs',
    preview: 'She mentioned new endpoints are undocumented. Check Slack thread.',
    source: 'slack',
    time: '5h ago',
  },
  {
    id: 'c7',
    title: 'Review HubSpot lead scoring rules',
    preview: 'Marketing asked to revisit lead scoring weights for Q2.',
    source: 'gmail',
    time: '1d ago',
  },
];

const ideaItems: CortexItem[] = [
  {
    id: 'c8',
    title: 'Automated weekly digest email',
    preview: 'Send a summary of key metrics + tasks completed to the team every Friday.',
    time: '2d ago',
  },
  {
    id: 'c9',
    title: 'CLI tool for quick task creation',
    preview: 'Would be nice to capture tasks from terminal without opening browser.',
    time: '3d ago',
  },
  {
    id: 'c10',
    title: 'Integration with Linear for eng tasks',
    preview: 'Two-way sync so engineering tickets auto-surface in Cortex.',
    time: '5d ago',
  },
  {
    id: 'c11',
    title: 'Dark mode toggle per-workspace',
    preview: 'Some users might want light mode for specific workstreams or data views.',
    time: '1w ago',
  },
];

const sourceIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  slack: MessageSquare,
  gmail: Mail,
  calendar: Calendar,
  manual: Brain,
};

// ---------------------------------------------------------------------------
// Column component
// ---------------------------------------------------------------------------

function CortexColumn({
  title,
  icon: Icon,
  count,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  items: CortexItem[];
}) {
  return (
    <div className="flex flex-1 flex-col rounded-md border border-border-subtle bg-bg-base min-w-[280px]">
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-text-tertiary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {title}
          </h3>
          <Badge>{count}</Badge>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {items.map((item) => {
          const SourceIcon = item.source ? sourceIcon[item.source] : Brain;
          return (
            <div
              key={item.id}
              className="rounded-md border border-border-subtle bg-bg-surface p-3 transition-colors hover:bg-bg-elevated cursor-pointer"
            >
              <div className="flex items-start gap-2">
                {SourceIcon && (
                  <SourceIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary line-clamp-2">
                    {item.preview}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">{item.time}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-3 w-3" />
                    Task
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Archive className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CortexPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent-500" />
          <h1 className="text-lg font-semibold text-text-primary">Inner Cortex</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Quick capture bar */}
      <div className="border-b border-border-subtle px-6 py-3">
        <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 py-2 transition-colors focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500/30">
          <Plus className="h-4 w-4 text-text-tertiary shrink-0" />
          <input
            type="text"
            placeholder="Capture a thought, task, or idea... (Cmd+Shift+N)"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <kbd className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
            {'\u21E7\u2318N'}
          </kbd>
        </div>
      </div>

      {/* Three column triage layout */}
      <div className="flex flex-1 gap-3 overflow-x-auto p-4">
        <CortexColumn
          title="Inbox"
          icon={Inbox}
          count={inboxItems.length}
          items={inboxItems}
        />
        <CortexColumn
          title="Triage"
          icon={Filter}
          count={triageItems.length}
          items={triageItems}
        />
        <CortexColumn
          title="Ideas"
          icon={Lightbulb}
          count={ideaItems.length}
          items={ideaItems}
        />
      </div>
    </div>
  );
}
