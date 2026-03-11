import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Inline types (mirrors the DB schema but avoids importing server-side code)
// ---------------------------------------------------------------------------

type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
type TaskEnergyLevel = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  energy_level: TaskEnergyLevel | null;
  workstream_id: string | null;
  due_date: string | null; // ISO date string
  scheduled_date: string | null;
  completed_at: string | null;
  sort_order: number;
  is_cortex_item: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface TaskState {
  tasks: Record<string, Task>;

  // Computed getters
  tasksByWorkstream: (workstreamId: string) => Task[];
  cortexTasks: () => Task[];

  // CRUD actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;

  // Workflow helpers
  moveTask: (id: string, status: TaskStatus) => void;
  reorderTask: (id: string, newSortOrder: number) => void;
  setTaskPriority: (id: string, priority: TaskPriority) => void;
  setTaskDueDate: (id: string, dueDate: string | null) => void;

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

  cortexTasks: () =>
    Object.values(get().tasks)
      .filter((t) => t.is_cortex_item)
      .sort((a, b) => a.sort_order - b.sort_order),

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

  setTaskPriority: (id, priority) =>
    set((s) => {
      const existing = s.tasks[id];
      if (!existing) return s;
      return {
        tasks: {
          ...s.tasks,
          [id]: {
            ...existing,
            priority,
            updated_at: new Date().toISOString(),
          },
        },
      };
    }),

  setTaskDueDate: (id, dueDate) =>
    set((s) => {
      const existing = s.tasks[id];
      if (!existing) return s;
      return {
        tasks: {
          ...s.tasks,
          [id]: {
            ...existing,
            due_date: dueDate,
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
