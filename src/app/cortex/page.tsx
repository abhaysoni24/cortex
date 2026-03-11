'use client';

import { useCallback, useEffect, useState } from 'react';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewTaskDialog } from '@/components/tasks/new-task-dialog';
import type { Task, CortexCategory } from '@/stores/task-store';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface Workstream {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

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
  onConvertToTask,
  onArchive,
  archiving,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  items: Task[];
  onConvertToTask: (item: Task) => void;
  onArchive: (item: Task) => void;
  archiving: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col rounded-none border-2 border-border-default bg-bg-base min-w-[280px]">
      {/* Column header */}
      <div className="flex items-center justify-between border-b-2 border-border-default px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-500 font-mono">
            {title}
          </h3>
          <Badge>{count}</Badge>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {items.length === 0 && (
          <p className="py-4 text-center text-xs text-text-tertiary font-mono">No items</p>
        )}
        {items.map((item) => {
          const SourceIcon = item.source_type
            ? sourceIcon[item.source_type] ?? Brain
            : Brain;
          const isArchiving = archiving === item.id;
          return (
            <div
              key={item.id}
              className="rounded-none border-2 border-border-default bg-bg-surface p-3 transition-colors hover:border-accent-500 cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <SourceIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary leading-snug font-mono">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-xs text-text-tertiary line-clamp-2 font-mono">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary font-mono">
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConvertToTask(item);
                    }}
                  >
                    <ArrowRight className="h-3 w-3" />
                    Task
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isArchiving}
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(item);
                    }}
                  >
                    {isArchiving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Archive className="h-3 w-3" />
                    )}
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
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureText, setCaptureText] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDefaultTitle, setDialogDefaultTitle] = useState('');

  // -------------------------------------------------------------------------
  // Fetch data
  // -------------------------------------------------------------------------

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks?cortex=true');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Task[] = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch cortex items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    async function fetchWorkstreams() {
      try {
        const res = await fetch('/api/workstreams');
        if (!res.ok) return;
        setWorkstreams(await res.json());
      } catch (err) {
        console.error('Failed to fetch workstreams:', err);
      }
    }
    fetchWorkstreams();
  }, []);

  // -------------------------------------------------------------------------
  // Quick capture
  // -------------------------------------------------------------------------

  const handleCapture = async () => {
    if (!captureText.trim() || capturing) return;
    setCapturing(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: captureText.trim(),
          is_cortex_item: true,
          cortex_category: 'inbox',
        }),
      });
      if (!res.ok) throw new Error('Failed to capture');
      const created: Task = await res.json();
      setItems((prev) => [created, ...prev]);
      setCaptureText('');
    } catch (err) {
      console.error('Failed to capture item:', err);
    } finally {
      setCapturing(false);
    }
  };

  // -------------------------------------------------------------------------
  // Archive (mark as done)
  // -------------------------------------------------------------------------

  const handleArchive = async (item: Task) => {
    setArchiving(item.id);
    try {
      const res = await fetch(`/api/tasks/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      });
      if (!res.ok) throw new Error('Failed to archive');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('Failed to archive item:', err);
    } finally {
      setArchiving(null);
    }
  };

  // -------------------------------------------------------------------------
  // Convert to task (open dialog with title pre-filled)
  // -------------------------------------------------------------------------

  const handleConvertToTask = (item: Task) => {
    setDialogDefaultTitle(item.title);
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Group items by cortex category
  // -------------------------------------------------------------------------

  const inboxItems = items.filter(
    (i) => i.cortex_category === 'inbox' && i.status !== 'done'
  );
  const triageItems = items.filter(
    (i) => i.cortex_category === 'triage' && i.status !== 'done'
  );
  const ideaItems = items.filter(
    (i) =>
      (i.cortex_category === 'idea' || i.cortex_category === 'assistant_suggestion') &&
      i.status !== 'done'
  );

  // If there are items without a category, put them in inbox
  const uncategorized = items.filter(
    (i) => !i.cortex_category && i.status !== 'done'
  );

  const allInbox = [...inboxItems, ...uncategorized];

  return (
    <div className="flex h-full flex-col font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border-default px-6 py-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-terminal-400" />
          <h1 className="text-lg font-semibold font-mono uppercase tracking-widest text-accent-500">Inner Cortex</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Quick capture bar */}
      <div className="border-b-2 border-border-default px-6 py-3">
        <div className="flex items-center gap-2 rounded-none border-2 border-border-default bg-bg-base px-3 py-2 transition-colors focus-within:border-accent-500">
          {capturing ? (
            <Loader2 className="h-4 w-4 text-text-tertiary shrink-0 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 text-text-tertiary shrink-0" />
          )}
          <input
            type="text"
            value={captureText}
            onChange={(e) => setCaptureText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCapture();
            }}
            placeholder="Capture a thought, task, or idea... (Cmd+Shift+N)"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none font-mono"
            disabled={capturing}
          />
          <kbd className="rounded-none border border-border-default bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary font-mono">
            {'\u21E7\u2318N'}
          </kbd>
        </div>
      </div>

      {/* Three column triage layout */}
      {loading ? (
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-1 flex-col rounded-none border-2 border-border-default bg-bg-base min-w-[280px]"
            >
              <div className="flex items-center gap-2 border-b-2 border-border-default px-3 py-2">
                <div className="h-4 w-16 animate-pulse rounded-none bg-bg-elevated" />
              </div>
              <div className="flex-1 space-y-2 p-2">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-20 animate-pulse rounded-none bg-bg-elevated"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          <CortexColumn
            title="Inbox"
            icon={Inbox}
            count={allInbox.length}
            items={allInbox}
            onConvertToTask={handleConvertToTask}
            onArchive={handleArchive}
            archiving={archiving}
          />
          <CortexColumn
            title="Triage"
            icon={Filter}
            count={triageItems.length}
            items={triageItems}
            onConvertToTask={handleConvertToTask}
            onArchive={handleArchive}
            archiving={archiving}
          />
          <CortexColumn
            title="Ideas"
            icon={Lightbulb}
            count={ideaItems.length}
            items={ideaItems}
            onConvertToTask={handleConvertToTask}
            onArchive={handleArchive}
            archiving={archiving}
          />
        </div>
      )}

      {/* New Task Dialog */}
      <NewTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => fetchItems()}
        defaultTitle={dialogDefaultTitle}
        workstreams={workstreams}
      />
    </div>
  );
}
