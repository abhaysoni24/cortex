'use client';

import {
  Settings,
  MessageSquare,
  Mail,
  Calendar,
  Database,
  BarChart3,
  PieChart,
  Check,
  X,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

interface Integration {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  description: string;
}

const integrations: Integration[] = [
  { name: 'Slack', icon: MessageSquare, connected: true, description: 'Messages, channels, and notifications' },
  { name: 'Gmail', icon: Mail, connected: true, description: 'Email threads and drafts' },
  { name: 'Google Calendar', icon: Calendar, connected: true, description: 'Events and scheduling' },
  { name: 'BigQuery', icon: Database, connected: false, description: 'SQL queries and data analysis' },
  { name: 'HubSpot', icon: PieChart, connected: false, description: 'CRM contacts and deals' },
  { name: 'GA4', icon: BarChart3, connected: true, description: 'Analytics and user metrics' },
];

interface Shortcut {
  keys: string[];
  action: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['\u2318', 'K'], action: 'Open command palette' },
  { keys: ['\u2318', 'N'], action: 'New task' },
  { keys: ['\u2318', '\u21E7', 'N'], action: 'Quick capture (Cortex)' },
  { keys: ['\u2318', '\\'], action: 'Toggle sidebar' },
  { keys: ['\u2318', '1'], action: 'Go to Command Center' },
  { keys: ['\u2318', '2'], action: 'Go to Inner Cortex' },
  { keys: ['\u2318', '3'], action: 'Go to Data Terminal' },
  { keys: ['\u2318', '4'], action: 'Go to Calendar' },
  { keys: ['Esc'], action: 'Close modal / slide-over' },
  { keys: ['?'], action: 'Show keyboard shortcuts' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-6 py-3">
        <Settings className="h-5 w-5 text-accent-500" />
        <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Integrations */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-1">Integrations</h2>
          <p className="text-xs text-text-tertiary mb-4">
            Connect your tools to bring signals into Cortex.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.name}
                  className="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-surface p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-elevated">
                    <Icon className="h-5 w-5 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {integration.name}
                      </span>
                      {integration.connected ? (
                        <Badge variant="status-success">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge>
                          <X className="mr-1 h-3 w-3" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      {integration.description}
                    </p>
                  </div>
                  <Button
                    variant={integration.connected ? 'ghost' : 'secondary'}
                    size="sm"
                  >
                    {integration.connected ? 'Configure' : 'Connect'}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Workstream Management */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-1">Workstream Management</h2>
          <p className="text-xs text-text-tertiary mb-4">
            Create, rename, archive, or reorder your workstreams.
          </p>
          <div className="rounded-md border border-border-subtle bg-bg-surface p-4">
            <div className="space-y-2">
              {[
                { name: 'Growth', color: 'bg-status-success', tasks: 24, status: 'active' },
                { name: 'Platform', color: 'bg-status-info', tasks: 18, status: 'active' },
                { name: 'Analytics', color: 'bg-accent-500', tasks: 12, status: 'active' },
                { name: 'Design System', color: 'bg-purple-500', tasks: 7, status: 'active' },
              ].map((ws) => (
                <div
                  key={ws.name}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-bg-elevated transition-colors"
                >
                  <span className={cn('h-3 w-3 rounded-full', ws.color)} />
                  <span className="flex-1 text-sm text-text-primary">{ws.name}</span>
                  <span className="text-xs text-text-tertiary">{ws.tasks} tasks</span>
                  <Badge variant="status-success">{ws.status}</Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Button variant="secondary" size="sm">+ New Workstream</Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* Keyboard Shortcuts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="h-4 w-4 text-text-tertiary" />
            <h2 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h2>
          </div>
          <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Shortcut
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((shortcut, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <span key={j}>
                            {j > 0 && (
                              <span className="mx-0.5 text-text-tertiary">+</span>
                            )}
                            <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border-default bg-bg-elevated px-1.5 font-mono text-xs text-text-secondary">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-text-secondary">
                      {shortcut.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Separator />

        {/* Preferences */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-1">Preferences</h2>
          <p className="text-xs text-text-tertiary mb-4">
            Customize your Cortex experience.
          </p>
          <div className="rounded-md border border-border-subtle bg-bg-surface p-4 space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-primary">Theme</p>
                <p className="text-xs text-text-tertiary">Choose your preferred color scheme</p>
              </div>
              <div className="flex items-center rounded-md border border-border-subtle bg-bg-base">
                <button className="bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary">
                  Dark
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-text-tertiary">
                  Light
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-text-tertiary">
                  System
                </button>
              </div>
            </div>

            {/* Default view */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-primary">Default Workstream View</p>
                <p className="text-xs text-text-tertiary">View shown when opening a workstream</p>
              </div>
              <div className="flex items-center rounded-md border border-border-subtle bg-bg-base">
                <button className="bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary">
                  Kanban
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-text-tertiary">
                  List
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-text-tertiary">
                  Plan
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-primary">Desktop Notifications</p>
                <p className="text-xs text-text-tertiary">Get notified about blockers and overdue tasks</p>
              </div>
              <Button variant="secondary" size="sm">Enabled</Button>
            </div>
          </div>
        </section>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
