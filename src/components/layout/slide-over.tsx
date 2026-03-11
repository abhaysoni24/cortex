'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SlideOverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function SlideOver({
  open,
  onOpenChange,
  title,
  children,
  width = '480px',
}: SlideOverProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 z-50 flex h-screen flex-col border-l-2 border-border-default bg-bg-surface',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
            'duration-200'
          )}
          style={{ width }}
        >
          {/* Header */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b-2 border-border-default px-4">
            <Dialog.Title className="text-sm font-bold font-mono uppercase tracking-wider text-accent-500">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-none border-2 border-transparent p-1.5 text-text-tertiary transition-colors hover:border-border-default hover:bg-bg-elevated hover:text-text-secondary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
