'use client';

import {
  Settings,
  MessageSquare,
  Mail,
  Calendar,
  Database,
  BarChart3,
  PieChart,
  Keyboard,
  RotateCw,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

type IntegrationStatus = 'not_configured' | 'connected' | 'auth_error' | 'api_error';

interface Integration {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: IntegrationStatus;
  lastSync: string | null;
  description: string;
}

const integrations: Integration[] = [
  { name: 'Slack', icon: MessageSquare, status: 'not_configured', lastSync: null, description: 'Team messaging & notifications' },
  { name: 'Gmail', icon: Mail, status: 'not_configured', lastSync: null, description: 'Email inbox & signals' },
  { name: 'Google Calendar', icon: Calendar, status: 'not_configured', lastSync: null, description: 'Meeting prep & schedule' },
  { name: 'BigQuery', icon: Database, status: 'not_configured', lastSync: null, description: 'SQL data warehouse' },
  { name: 'HubSpot', icon: PieChart, status: 'not_configured', lastSync: null, description: 'CRM pipeline & contacts' },
  { name: 'GA4', icon: BarChart3, status: 'not_configured', lastSync: null, description: 'Web analytics & metrics' },
];

const statusIndicatorColor: Record<IntegrationStatus, string> = {
  not_configured: 'bg-text-tertiary',
  connected: 'bg-status-success',
  auth_error: 'bg-status-danger',
  api_error: 'bg-status-warning',
};

const statusBadgeStyles: Record<IntegrationStatus, string> = {
  not_configured: 'text-status-danger border-2 border-status-danger bg-bg-elevated',
  connected: 'text-terminal-400 border-2 border-terminal-400 bg-bg-elevated',
  auth_error: 'text-status-danger border-2 border-status-danger bg-bg-elevated',
  api_error: 'text-status-warning border-2 border-status-warning bg-bg-elevated',
};

const statusBadgeLabel: Record<IntegrationStatus, string> = {
  not_configured: 'NOT CONFIGURED',
  connected: 'ONLINE',
  auth_error: 'AUTH ERROR',
  api_error: 'API ERROR',
};

const statusActionLabel: Record<IntegrationStatus, string> = {
  not_configured: 'CONNECT',
  connected: 'CONFIGURE',
  auth_error: 'RETRY',
  api_error: 'RETRY',
};

const statusActionStyles: Record<IntegrationStatus, string> = {
  not_configured: 'text-accent-500 border-2 border-accent-500 hover:bg-accent-500/10',
  connected: 'text-text-secondary border-2 border-border-default hover:bg-bg-elevated',
  auth_error: 'text-status-danger border-2 border-status-danger hover:bg-status-danger/10',
  api_error: 'text-status-warning border-2 border-status-warning hover:bg-status-warning/10',
};

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

function formatLastSync(lastSync: string | null): string {
  if (!lastSync) return 'NEVER';
  try {
    return new Date(lastSync).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).toUpperCase();
  } catch {
    return 'NEVER';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b-2 border-border-default px-6 py-3">
        <Settings className="h-5 w-5 text-accent-500" />
        <h1 className="font-mono text-lg font-bold uppercase tracking-widest text-accent-500">
          System Config
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Integrations */}
        <section>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent-500 border-b-2 border-border-default pb-2 mb-1">
            Integrations
          </h2>
          <p className="font-mono text-xs text-text-tertiary mb-4 mt-2">
            Connect your tools to bring signals into Cortex.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.name}
                  className="flex items-start gap-3 border-2 border-border-default rounded-none bg-bg-surface p-4"
                >
                  {/* Status indicator light */}
                  <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-none', statusIndicatorColor[integration.status])} />

                  {/* Icon container */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border-default bg-bg-base rounded-none">
                    <Icon className="h-5 w-5 text-text-secondary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-text-primary">
                        {integration.name}
                      </span>
                      <span className={cn(
                        'inline-flex items-center rounded-none px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                        statusBadgeStyles[integration.status]
                      )}>
                        {statusBadgeLabel[integration.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-text-tertiary">
                      {integration.description}
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-wider text-text-tertiary">
                      LAST SYNC: {formatLastSync(integration.lastSync)}
                    </p>
                  </div>

                  {/* Action button */}
                  <button
                    className={cn(
                      'shrink-0 rounded-none bg-transparent px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors',
                      statusActionStyles[integration.status]
                    )}
                  >
                    {integration.status === 'auth_error' || integration.status === 'api_error' ? (
                      <span className="flex items-center gap-1.5">
                        <RotateCw className="h-3 w-3" />
                        {statusActionLabel[integration.status]}
                      </span>
                    ) : (
                      statusActionLabel[integration.status]
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Separator */}
        <div className="h-px w-full bg-border-default" />

        {/* Workstream Management */}
        <section>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent-500 border-b-2 border-border-default pb-2 mb-1">
            Workstream Management
          </h2>
          <p className="font-mono text-xs text-text-tertiary mb-4 mt-2">
            Create, rename, archive, or reorder your workstreams.
          </p>
          <div className="border-2 border-border-default rounded-none bg-bg-surface p-4">
            <div className="space-y-2">
              {[
                { name: 'Growth', color: 'bg-status-success', tasks: 24, status: 'active' },
                { name: 'Platform', color: 'bg-status-info', tasks: 18, status: 'active' },
                { name: 'Analytics', color: 'bg-accent-500', tasks: 12, status: 'active' },
                { name: 'Design System', color: 'bg-purple-500', tasks: 7, status: 'active' },
              ].map((ws) => (
                <div
                  key={ws.name}
                  className="flex items-center gap-3 rounded-none px-2 py-2 hover:bg-bg-elevated transition-colors"
                >
                  <span className={cn('h-3 w-3 rounded-none', ws.color)} />
                  <span className="flex-1 font-mono text-sm text-text-primary">{ws.name}</span>
                  <span className="font-mono text-xs text-text-tertiary">{ws.tasks} tasks</span>
                  <span className="inline-flex items-center rounded-none border-2 border-terminal-400 bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-terminal-400">
                    {ws.status}
                  </span>
                  <button className="rounded-none border-2 border-border-default bg-transparent px-2 py-1 font-mono text-xs text-text-secondary hover:bg-bg-elevated transition-colors">
                    EDIT
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button className="rounded-none border-2 border-accent-500 bg-transparent px-3 py-1.5 font-mono text-xs font-bold uppercase text-accent-500 hover:bg-accent-500/10 transition-colors">
                + New Workstream
              </button>
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="h-px w-full bg-border-default" />

        {/* Keyboard Shortcuts */}
        <section>
          <div className="flex items-center gap-2 border-b-2 border-border-default pb-2 mb-4">
            <Keyboard className="h-4 w-4 text-accent-500" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent-500">
              Keyboard Shortcuts
            </h2>
          </div>
          <div className="border-2 border-border-default rounded-none bg-bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border-default bg-bg-elevated">
                  <th className="px-4 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-accent-500">
                    Shortcut
                  </th>
                  <th className="px-4 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-accent-500">
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
                              <span className="mx-0.5 font-mono text-text-tertiary">+</span>
                            )}
                            <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-none border-2 border-border-default bg-bg-base px-1.5 font-mono text-xs text-accent-500">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 font-mono text-text-secondary">
                      {shortcut.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Separator */}
        <div className="h-px w-full bg-border-default" />

        {/* Preferences */}
        <section>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent-500 border-b-2 border-border-default pb-2 mb-1">
            Preferences
          </h2>
          <p className="font-mono text-xs text-text-tertiary mb-4 mt-2">
            Customize your Cortex experience.
          </p>
          <div className="border-2 border-border-default rounded-none bg-bg-surface p-4 space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-text-primary">Theme</p>
                <p className="font-mono text-xs text-text-tertiary">Choose your preferred color scheme</p>
              </div>
              <div className="flex items-center border-2 border-border-default bg-bg-base">
                <button className="bg-accent-500 px-3 py-1.5 font-mono text-xs font-bold uppercase text-black">
                  Dark
                </button>
                <button className="px-3 py-1.5 font-mono text-xs uppercase text-text-tertiary hover:text-text-primary transition-colors">
                  Light
                </button>
                <button className="px-3 py-1.5 font-mono text-xs uppercase text-text-tertiary hover:text-text-primary transition-colors">
                  System
                </button>
              </div>
            </div>

            {/* Default view */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-text-primary">Default Workstream View</p>
                <p className="font-mono text-xs text-text-tertiary">View shown when opening a workstream</p>
              </div>
              <div className="flex items-center border-2 border-border-default bg-bg-base">
                <button className="bg-accent-500 px-3 py-1.5 font-mono text-xs font-bold uppercase text-black">
                  Kanban
                </button>
                <button className="px-3 py-1.5 font-mono text-xs uppercase text-text-tertiary hover:text-text-primary transition-colors">
                  List
                </button>
                <button className="px-3 py-1.5 font-mono text-xs uppercase text-text-tertiary hover:text-text-primary transition-colors">
                  Plan
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-text-primary">Desktop Notifications</p>
                <p className="font-mono text-xs text-text-tertiary">Get notified about blockers and overdue tasks</p>
              </div>
              <button className="rounded-none border-2 border-accent-500 bg-accent-500 px-3 py-1.5 font-mono text-xs font-bold uppercase text-black transition-colors hover:bg-accent-500/90">
                Enabled
              </button>
            </div>
          </div>
        </section>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
