'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui-store';

const routeLabels: Record<string, string> = {
  '/': 'Command Center',
  '/cortex': 'Inner Cortex',
  '/data': 'Data Terminal',
  '/calendar': 'Calendar',
  '/settings': 'Settings',
};

function getBreadcrumb(pathname: string): { segments: string[] } {
  if (routeLabels[pathname]) {
    return { segments: [routeLabels[pathname]] };
  }

  if (pathname.startsWith('/workstreams/')) {
    const id = pathname.split('/')[2];
    return { segments: ['Workstreams', id ?? ''] };
  }

  const parts = pathname.split('/').filter(Boolean);
  return {
    segments: parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)),
  };
}

export function TopBar() {
  const pathname = usePathname();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const { segments } = getBreadcrumb(pathname);

  return (
    <header className="flex h-12 shrink-0 items-center border-b-2 border-border-default bg-bg-base px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm font-mono uppercase tracking-wider">
        {segments.map((segment, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className="text-text-tertiary">/</span>
            )}
            <span
              className={cn(
                i === segments.length - 1
                  ? 'text-accent-500 font-bold'
                  : 'text-text-tertiary'
              )}
            >
              {segment}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Command palette trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="mx-4 flex max-w-[400px] flex-1 cursor-pointer items-center gap-2 rounded-none border-2 border-border-default bg-bg-base px-3 py-1.5 text-sm font-mono text-text-tertiary transition-colors hover:border-accent-500 hover:text-text-secondary"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left">Search or type a command...</span>
        <kbd className="rounded-none border-2 border-border-default bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-accent-500">
          {'\u2318K'}
        </kbd>
      </button>

      {/* Settings */}
      <button
        className="rounded-none border-2 border-transparent p-2 text-text-tertiary transition-colors hover:border-border-default hover:bg-bg-elevated hover:text-text-secondary"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>
    </header>
  );
}
