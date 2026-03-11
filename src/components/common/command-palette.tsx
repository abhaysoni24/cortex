'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  Brain,
  Database,
  Calendar,
  Settings,
  Plus,
  CheckSquare,
  Layers,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
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
            'fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-none border-2 border-accent-500 bg-bg-overlay shadow-[3px_3px_0_#000]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2',
            'duration-150'
          )}
        >
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search or type a command to navigate
          </Dialog.Description>

          <Command className="flex flex-col" loop>
            {/* Search input */}
            <div className="flex items-center gap-2 border-b-2 border-border-default px-3">
              <span className="font-mono text-sm text-accent-500 font-bold">&gt;</span>
              <Command.Input
                placeholder="Search or type a command..."
                className="flex-1 bg-transparent py-3 text-sm font-mono text-text-primary outline-none placeholder:text-text-tertiary caret-accent-500"
                autoFocus
              />
            </div>

            {/* Results */}
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-center text-sm font-mono text-text-tertiary">
                No results found.
              </Command.Empty>

              {/* Navigation */}
              <Command.Group
                heading="Navigation"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-accent-500 [&_[cmdk-group-heading]]:font-mono"
              >
                <CommandItem icon={LayoutDashboard} label="Command Center" shortcut={'\u23181'} />
                <CommandItem icon={Brain} label="Inner Cortex" shortcut={'\u23182'} />
                <CommandItem icon={Database} label="Data Terminal" shortcut={'\u23183'} />
                <CommandItem icon={Calendar} label="Calendar" shortcut={'\u23184'} />
                <CommandItem icon={Settings} label="Settings" />
              </Command.Group>

              {/* Recent Tasks */}
              <Command.Group
                heading="Recent Tasks"
                className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-accent-500 [&_[cmdk-group-heading]]:font-mono"
              >
                <CommandItem icon={CheckSquare} label="Review Q3 metrics dashboard" />
                <CommandItem icon={CheckSquare} label="Update API documentation" />
              </Command.Group>

              {/* Actions */}
              <Command.Group
                heading="Actions"
                className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-accent-500 [&_[cmdk-group-heading]]:font-mono"
              >
                <CommandItem icon={Plus} label="New Task" shortcut={'\u2318N'} />
                <CommandItem icon={Plus} label="New Workstream" />
              </Command.Group>

              {/* Workstreams */}
              <Command.Group
                heading="Workstreams"
                className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-accent-500 [&_[cmdk-group-heading]]:font-mono"
              >
                <CommandItem icon={Layers} label="Growth" />
                <CommandItem icon={Layers} label="Infrastructure" />
                <CommandItem icon={Layers} label="Design System" />
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CommandItem({
  icon: Icon,
  label,
  shortcut,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
}) {
  return (
    <Command.Item
      className="flex cursor-pointer items-center gap-2.5 rounded-none px-2 py-2 text-sm font-mono text-text-secondary data-[selected=true]:bg-accent-500/15 data-[selected=true]:text-accent-500 data-[selected=true]:border-l-2 data-[selected=true]:border-accent-500"
      value={label}
    >
      <Icon className="h-4 w-4 shrink-0 text-text-tertiary" />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="rounded-none border-2 border-border-default bg-bg-base px-1.5 py-0.5 font-mono text-[10px] text-accent-500">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
