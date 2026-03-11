'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import type { TaskStatus, TaskPriority } from '@/stores/task-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Workstream {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (task: any) => void;
  defaultStatus?: TaskStatus;
  defaultTitle?: string;
  defaultWorkstreamId?: string | null;
  workstreams?: Workstream[];
}

// ---------------------------------------------------------------------------
// Priority options
// ---------------------------------------------------------------------------

const priorityOptions: { value: TaskPriority; label: string; dotClass: string }[] = [
  { value: 'p0', label: 'P0 - Critical', dotClass: 'bg-priority-p0' },
  { value: 'p1', label: 'P1 - High', dotClass: 'bg-priority-p1' },
  { value: 'p2', label: 'P2 - Medium', dotClass: 'bg-priority-p2' },
  { value: 'p3', label: 'P3 - Low', dotClass: 'bg-priority-p3' },
];

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NewTaskDialog({
  open,
  onOpenChange,
  onCreated,
  defaultStatus = 'planned',
  defaultTitle = '',
  defaultWorkstreamId = null,
  workstreams = [],
}: NewTaskDialogProps) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('p2');
  const [status, setStatus] = React.useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = React.useState('');
  const [workstreamId, setWorkstreamId] = React.useState<string | null>(
    defaultWorkstreamId
  );
  const [submitting, setSubmitting] = React.useState(false);

  // Reset form when dialog opens with new defaults
  React.useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setDescription('');
      setPriority('p2');
      setStatus(defaultStatus);
      setDueDate('');
      setWorkstreamId(defaultWorkstreamId);
    }
  }, [open, defaultTitle, defaultStatus, defaultWorkstreamId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        status,
        priority,
      };
      if (description.trim()) body.description = description.trim();
      if (dueDate) body.due_date = new Date(dueDate).toISOString();
      if (workstreamId) {
        body.workstream_id = workstreamId;
      } else {
        body.is_cortex_item = true;
        body.cortex_category = 'inbox';
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to create task');

      const created = await res.json();
      onCreated?.(created);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border-subtle bg-bg-surface shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
            <Dialog.Title className="text-sm font-semibold text-text-primary">
              New Task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded p-1 text-text-tertiary hover:bg-bg-elevated hover:text-text-secondary">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Title <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className="w-full rounded-md border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details, context, or links..."
                rows={3}
                className="w-full rounded-md border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 resize-none"
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-md border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 appearance-none cursor-pointer"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-md border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 appearance-none cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date + Workstream row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30"
                />
              </div>

              {/* Workstream */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Workstream
                </label>
                <select
                  value={workstreamId ?? ''}
                  onChange={(e) =>
                    setWorkstreamId(e.target.value || null)
                  }
                  className="w-full rounded-md border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 appearance-none cursor-pointer"
                >
                  <option value="">Inner Cortex</option>
                  {workstreams.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border-subtle pt-4">
              <span className="text-[10px] text-text-tertiary">
                {'\u2318'}+Enter to submit
              </span>
              <div className="flex gap-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="sm">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!title.trim() || submitting}
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
