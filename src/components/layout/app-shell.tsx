'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui-store';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base">
      <Sidebar />

      <main
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-200',
          collapsed ? 'ml-14' : 'ml-60'
        )}
      >
        <TopBar />

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
