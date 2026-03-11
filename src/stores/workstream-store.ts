import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Inline types (mirrors the DB schema but avoids importing server-side code)
// ---------------------------------------------------------------------------

type WorkstreamStatus = 'active' | 'archived' | 'paused';

interface Workstream {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string | null;
  description: string | null;
  status: WorkstreamStatus;
  sort_order: number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface WorkstreamState {
  workstreams: Workstream[];
  activeWorkstreamId: string | null;

  // Actions
  setActiveWorkstream: (id: string | null) => void;
  addWorkstream: (workstream: Workstream) => void;
  updateWorkstream: (id: string, updates: Partial<Omit<Workstream, 'id'>>) => void;
  archiveWorkstream: (id: string) => void;

  // Bulk setter (useful after fetching from API)
  setWorkstreams: (workstreams: Workstream[]) => void;
}

export const useWorkstreamStore = create<WorkstreamState>((set) => ({
  workstreams: [],
  activeWorkstreamId: null,

  setActiveWorkstream: (id) => set({ activeWorkstreamId: id }),

  addWorkstream: (workstream) =>
    set((s) => ({ workstreams: [...s.workstreams, workstream] })),

  updateWorkstream: (id, updates) =>
    set((s) => ({
      workstreams: s.workstreams.map((w) =>
        w.id === id ? { ...w, ...updates } : w,
      ),
    })),

  archiveWorkstream: (id) =>
    set((s) => ({
      workstreams: s.workstreams.map((w) =>
        w.id === id ? { ...w, status: 'archived' as const } : w,
      ),
      // Clear active selection if the archived workstream was active
      activeWorkstreamId:
        s.activeWorkstreamId === id ? null : s.activeWorkstreamId,
    })),

  setWorkstreams: (workstreams) => set({ workstreams }),
}));
