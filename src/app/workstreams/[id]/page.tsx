'use client';

import { use, useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { NewTaskDialog } from '@/components/tasks/new-task-dialog';
import type { Task, TaskStatus } from '@/stores/task-store';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'inbox', label: 'Inbox' },
  { status: 'planned', label: 'Planned' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'waiting', label: 'Waiting' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'done', label: 'Done' },
];

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

interface Workstream {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
}

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

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Sortable Task Card
// ---------------------------------------------------------------------------

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dueLabel = formatDueDate(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => useUIStore.getState().setActiveSlideOver(task.id)}
      className="rounded-md border border-border-subtle bg-bg-surface p-3 transition-colors hover:bg-bg-elevated cursor-grab active:cursor-grabbing"
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
        {dueLabel && (
          <span
            className={cn(
              'text-xs',
              dueLabel === 'Overdue' ? 'text-status-danger' : 'text-text-tertiary'
            )}
          >
            {dueLabel}
          </span>
        )}
        {(task.subtask_count ?? 0) > 0 && (
          <span className="text-xs text-text-tertiary">
            {task.subtasks_done ?? 0}/{task.subtask_count}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static Task Card (for DragOverlay)
// ---------------------------------------------------------------------------

function TaskCardOverlay({ task }: { task: Task }) {
  const dueLabel = formatDueDate(task.due_date);

  return (
    <div className="w-56 rounded-md border border-accent-500/50 bg-bg-surface p-3 shadow-lg ring-1 ring-accent-500/20">
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
        {dueLabel && (
          <span
            className={cn(
              'text-xs',
              dueLabel === 'Overdue' ? 'text-status-danger' : 'text-text-tertiary'
            )}
          >
            {dueLabel}
          </span>
        )}
        {(task.subtask_count ?? 0) > 0 && (
          <span className="text-xs text-text-tertiary">
            {task.subtasks_done ?? 0}/{task.subtask_count}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Droppable Column
// ---------------------------------------------------------------------------

function KanbanColumn({
  status,
  label,
  tasks,
  onAddTask,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onAddTask: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  });

  return (
    <div
      className={cn(
        'flex w-64 shrink-0 flex-col rounded-md border bg-bg-base transition-colors',
        isOver
          ? 'border-accent-500/50 bg-accent-500/5'
          : 'border-border-subtle'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {label}
          </h3>
          <Badge>{tasks.length}</Badge>
        </div>
      </div>

      {/* Task list */}
      <div ref={setNodeRef} className="flex-1 space-y-2 overflow-y-auto p-2 min-h-[60px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
          id={status}
        >
          {tasks.length === 0 && (
            <p className="py-4 text-center text-xs text-text-tertiary">
              No tasks
            </p>
          )}
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      {/* Add task button */}
      <div className="border-t border-border-subtle p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-text-tertiary"
          onClick={onAddTask}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function KanbanSkeleton() {
  return (
    <div className="flex flex-1 gap-3 overflow-x-auto p-4">
      {columns.map((col) => (
        <div
          key={col.status}
          className="flex w-64 shrink-0 flex-col rounded-md border border-border-subtle bg-bg-base"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
            <div className="h-4 w-20 animate-pulse rounded bg-bg-elevated" />
          </div>
          <div className="flex-1 space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-md bg-bg-elevated"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function WorkstreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // State
  const [tasksByColumn, setTasksByColumn] = useState<Record<TaskStatus, Task[]>>({
    inbox: [],
    planned: [],
    in_progress: [],
    waiting: [],
    blocked: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('kanban');
  const [workstream, setWorkstream] = useState<Workstream | null>(null);
  const [allWorkstreams, setAllWorkstreams] = useState<Workstream[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDefaultStatus, setDialogDefaultStatus] = useState<TaskStatus>('planned');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // -------------------------------------------------------------------------
  // Fetch workstream info
  // -------------------------------------------------------------------------

  useEffect(() => {
    async function fetchWorkstreams() {
      try {
        const res = await fetch('/api/workstreams');
        if (!res.ok) return;
        const data: Workstream[] = await res.json();
        setAllWorkstreams(data);
        // Find the workstream matching the slug or ID
        const ws = data.find((w) => w.slug === id || w.id === id);
        if (ws) setWorkstream(ws);
      } catch (err) {
        console.error('Failed to fetch workstreams:', err);
      }
    }
    fetchWorkstreams();
  }, [id]);

  // -------------------------------------------------------------------------
  // Fetch tasks
  // -------------------------------------------------------------------------

  const fetchTasks = useCallback(async () => {
    try {
      // If we have a workstream ID, use it. Otherwise try the slug as ID.
      const wsId = workstream?.id ?? id;
      const res = await fetch(`/api/tasks?workstream_id=${wsId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Task[] = await res.json();

      const grouped: Record<TaskStatus, Task[]> = {
        inbox: [],
        planned: [],
        in_progress: [],
        waiting: [],
        blocked: [],
        done: [],
      };

      for (const task of data) {
        const col = grouped[task.status];
        if (col) col.push(task);
      }

      setTasksByColumn(grouped);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [workstream?.id, id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // -------------------------------------------------------------------------
  // DnD handlers
  // -------------------------------------------------------------------------

  const findTaskColumn = (taskId: string): TaskStatus | null => {
    for (const [status, tasks] of Object.entries(tasksByColumn)) {
      if (tasks.some((t) => t.id === taskId)) return status as TaskStatus;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const sourceColumn = findTaskColumn(active.id as string);
    if (sourceColumn) {
      const task = tasksByColumn[sourceColumn].find((t) => t.id === active.id);
      if (task) setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findTaskColumn(activeId);
    if (!activeColumn) return;

    // Determine target column: either directly over a column, or over a task in another column
    let overColumn: TaskStatus | null = null;
    if (overId.startsWith('column-')) {
      overColumn = overId.replace('column-', '') as TaskStatus;
    } else {
      overColumn = findTaskColumn(overId);
    }

    if (!overColumn || activeColumn === overColumn) return;

    // Move the task optimistically between columns during drag
    setTasksByColumn((prev) => {
      const activeItems = [...prev[activeColumn]];
      const overItems = [...prev[overColumn!]];
      const taskIndex = activeItems.findIndex((t) => t.id === activeId);
      if (taskIndex === -1) return prev;

      const [movedTask] = activeItems.splice(taskIndex, 1);
      const updatedTask = { ...movedTask, status: overColumn! };

      // Find insertion index
      const overTaskIndex = overItems.findIndex((t) => t.id === overId);
      if (overTaskIndex >= 0) {
        overItems.splice(overTaskIndex, 0, updatedTask);
      } else {
        overItems.push(updatedTask);
      }

      return {
        ...prev,
        [activeColumn]: activeItems,
        [overColumn!]: overItems,
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentColumn = findTaskColumn(activeId);
    if (!currentColumn) return;

    // Handle reordering within same column
    const overColumn = overId.startsWith('column-')
      ? (overId.replace('column-', '') as TaskStatus)
      : findTaskColumn(overId);

    if (!overColumn) return;

    if (currentColumn === overColumn && !overId.startsWith('column-')) {
      const items = tasksByColumn[currentColumn];
      const oldIndex = items.findIndex((t) => t.id === activeId);
      const newIndex = items.findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex) {
        setTasksByColumn((prev) => ({
          ...prev,
          [currentColumn]: arrayMove(prev[currentColumn], oldIndex, newIndex),
        }));
      }
    }

    // Find the task to get its original status
    const task = tasksByColumn[currentColumn].find((t) => t.id === activeId);
    const originalStatus = active.data.current?.task?.status as TaskStatus | undefined;

    // If status actually changed, patch the API
    if (originalStatus && originalStatus !== currentColumn) {
      try {
        const res = await fetch(`/api/tasks/${activeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: currentColumn }),
        });
        if (!res.ok) {
          // Revert on error
          console.error('Failed to update task status, reverting');
          fetchTasks();
        }
      } catch (err) {
        console.error('Failed to update task status:', err);
        fetchTasks();
      }
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    fetchTasks(); // Revert to server state
  };

  // -------------------------------------------------------------------------
  // Dialog handlers
  // -------------------------------------------------------------------------

  const openAddTaskDialog = (status: TaskStatus = 'planned') => {
    setDialogDefaultStatus(status);
    setDialogOpen(true);
  };

  const handleTaskCreated = () => {
    fetchTasks(); // Refresh from server
  };

  // -------------------------------------------------------------------------
  // Derive display name
  // -------------------------------------------------------------------------

  const displayName = workstream?.name ?? id.charAt(0).toUpperCase() + id.slice(1);
  const workstreamColor = workstream?.color ?? 'bg-status-success';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'h-3 w-3 rounded-full',
              !workstreamColor.startsWith('#') && workstreamColor
            )}
            style={
              workstreamColor.startsWith('#')
                ? { backgroundColor: workstreamColor }
                : undefined
            }
          />
          <h1 className="text-lg font-semibold text-text-primary">{displayName}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAddTaskDialog('planned')}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>

        {/* View switcher */}
        <div className="flex items-center rounded-md border border-border-subtle bg-bg-surface">
          {viewTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                tab.key === activeTab
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <KanbanSkeleton />
      ) : activeTab === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex flex-1 gap-3 overflow-x-auto p-4">
            {columns.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                tasks={tasksByColumn[col.status]}
                onAddTask={() => openAddTaskDialog(col.status)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-tertiary">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view coming
            soon
          </p>
        </div>
      )}

      {/* New Task Dialog */}
      <NewTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleTaskCreated}
        defaultStatus={dialogDefaultStatus}
        defaultWorkstreamId={workstream?.id ?? null}
        workstreams={allWorkstreams}
      />
    </div>
  );
}
