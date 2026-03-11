import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Inline types (mirrors the DB schema enums)
// ---------------------------------------------------------------------------

export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'waiting' | 'blocked' | 'done';
export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3';
export type CortexCategory = 'inbox' | 'triage' | 'idea' | 'assistant_suggestion';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  workstream_id: string | null;
  parent_task_id: string | null;
  due_date: string | null; // ISO date string
  sort_order: number;
  is_cortex_item: boolean;
  cortex_category: CortexCategory | null;
  source_type: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  subtask_count?: number;
  subtasks_done?: number;
  tags?: { id: string; name: string; color: string | null }[];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface TaskState {
  tasks: Record<string, Task>;

  // Computed getters
  tasksByWorkstream: (workstreamId: string) => Task[];
  tasksByStatus: (status: TaskStatus) => Task[];
  cortexTasks: () => Task[];
  priorityTasks: (limit?: number) => Task[];

  // CRUD actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;

  // Workflow helpers
  moveTask: (id: string, status: TaskStatus) => void;
  reorderTask: (id: string, newSortOrder: number) => void;

  // Bulk setter (useful after fetching from API)
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: {},

  // ---------- Computed getters ----------

  tasksByWorkstream: (workstreamId) =>
    Object.values(get().tasks)
      .filter((t) => t.workstream_id === workstreamId)
      .sort((a, b) => a.sort_order - b.sort_order),

  tasksByStatus: (status) =>
    Object.values(get().tasks)
      .filter((t) => t.status === status)
      .sort((a, b) => a.sort_order - b.sort_order),

  cortexTasks: () =>
    Object.values(get().tasks)
      .filter((t) => t.is_cortex_item)
      .sort((a, b) => a.sort_order - b.sort_order),

  priorityTasks: (limit = 5) =>
    Object.values(get().tasks)
      .filter((t) => t.status !== 'done')
      .sort((a, b) => {
        const priorityOrder = { p0: 0, p1: 1, p2: 2, p3: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, limit),

  // ---------- CRUD ----------

  addTask: (task) =>
    set((s) => ({ tasks: { ...s.tasks, [task.id]: task } })),

  updateTask: (id, updates) =>
    set((s) => {
      const existing = s.tasks[id];
      if (!existing) return s;
      return {
        tasks: {
          ...s.tasks,
          [id]: { ...existing, ...updates, updated_at: new Date().toISOString() },
        },
      };
    }),

  deleteTask: (id) =>
    set((s) => {
      const { [id]: _, ...remaining } = s.tasks;
      return { tasks: remaining };
    }),

  // ---------- Workflow helpers ----------

  moveTask: (id, status) =>
    set((s) => {
      const existing = s.tasks[id];
      if (!existing) return s;
      const now = new Date().toISOString();
      return {
        tasks: {
          ...s.tasks,
          [id]: {
            ...existing,
            status,
            completed_at: status === 'done' ? now : null,
            updated_at: now,
          },
        },
      };
    }),

  reorderTask: (id, newSortOrder) =>
    set((s) => {
      const existing = s.tasks[id];
      if (!existing) return s;
      return {
        tasks: {
          ...s.tasks,
          [id]: {
            ...existing,
            sort_order: newSortOrder,
            updated_at: new Date().toISOString(),
          },
        },
      };
    }),

  // ---------- Bulk ----------

  setTasks: (tasks) =>
    set({
      tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
    }),
}));
