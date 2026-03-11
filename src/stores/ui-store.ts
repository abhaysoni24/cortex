import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeSlideOver: string | null; // task ID or null
  setActiveSlideOver: (id: string | null) => void;
  activeView: 'kanban' | 'list' | 'plan' | 'agenda' | 'data';
  setActiveView: (view: 'kanban' | 'list' | 'plan' | 'agenda' | 'data') => void;
  assistantPanelOpen: boolean;
  toggleAssistantPanel: () => void;
  setAssistantPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  activeSlideOver: null,
  setActiveSlideOver: (id) => set({ activeSlideOver: id }),
  activeView: 'kanban',
  setActiveView: (view) => set({ activeView: view }),
  assistantPanelOpen: false,
  toggleAssistantPanel: () => set((s) => ({ assistantPanelOpen: !s.assistantPanelOpen })),
  setAssistantPanelOpen: (open) => set({ assistantPanelOpen: open }),
}));
