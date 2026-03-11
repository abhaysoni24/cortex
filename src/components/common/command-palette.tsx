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
            'fixed inset-0 z-50 bg-[#0B0B14]/70 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-accent-500/30 bg-bg-overlay/90 backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,0.15),0_25px_50px_-12px_rgba(0,0,0,0.5)]',
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
            <div className="flex items-center gap-2 border-b border-accent-500/20 px-3">
              <Search className="h-4 w-4 shrink-0 text-accent-400" />
              <Command.Input
                placeholder="Search or type a command..."
                className="flex-1 bg-transparent py-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary caret-accent-500"
                autoFocus
              />
            </div>

            {/* Results */}
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-center text-sm text-text-tertiary">
                No results found.
              </Command.Empty>

              {/* Navigation */}
              <Command.Group
                heading="Navigation"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-tertiary"
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
                className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-tertiary"
              >
                <CommandItem icon={CheckSquare} label="Review Q3 metrics dashboard" />
                <CommandItem icon={CheckSquare} label="Update API documentation" />
              </Command.Group>

              {/* Actions */}
              <Command.Group
                heading="Actions"
                className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-tertiary"
              >
                <CommandItem icon={Plus} label="New Task" shortcut={'\u2318N'} />
                <CommandItem icon={Plus} label="New Workstream" />
              </Command.Group>

              {/* Workstreams */}
              <Command.Group
                heading="Workstreams"
                className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-tertiary"
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
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-text-secondary data-[selected=true]:bg-accent-500/15 data-[selected=true]:text-text-primary data-[selected=true]:shadow-[inset_0_0_0_1px_rgba(168,85,247,0.2)]"
      value={label}
    >
      <Icon className="h-4 w-4 shrink-0 text-text-tertiary" />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
