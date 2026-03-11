'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';

export function useKeyboardShortcuts() {
  const { toggleSidebar, setCommandPaletteOpen, toggleAssistantPanel, setAssistantPanelOpen } = useUIStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      if (mod && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }

      if (mod && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        // TODO: Open new task dialog
      }

      if (mod && e.key === 'N' && e.shiftKey) {
        e.preventDefault();
        // TODO: Quick capture to Inner Cortex
      }

      if (mod && e.key === '1') {
        e.preventDefault();
        window.location.href = '/';
      }

      if (mod && e.key === '3') {
        e.preventDefault();
        window.location.href = '/cortex';
      }

      if (mod && e.key === '4') {
        e.preventDefault();
        window.location.href = '/data';
      }

      if (mod && e.key === '5') {
        e.preventDefault();
        window.location.href = '/calendar';
      }

      if (mod && e.key === 'j') {
        e.preventDefault();
        toggleAssistantPanel();
      }

      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setAssistantPanelOpen(false);
        useUIStore.getState().setActiveSlideOver(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, setCommandPaletteOpen, toggleAssistantPanel, setAssistantPanelOpen]);
}
