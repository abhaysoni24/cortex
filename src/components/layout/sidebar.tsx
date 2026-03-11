'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Brain,
  Database,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui-store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Command Center', href: '/', icon: LayoutDashboard },
  { label: 'Inner Cortex', href: '/cortex', icon: Brain },
  { label: 'Data Terminal', href: '/data', icon: Database },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface Workstream {
  id: string;
  name: string;
  color: string;
}

const placeholderWorkstreams: Workstream[] = [
  { id: '1', name: 'Growth', color: 'bg-status-success' },
  { id: '2', name: 'Infrastructure', color: 'bg-status-info' },
  { id: '3', name: 'Design System', color: 'bg-accent-500' },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border-subtle bg-bg-base/80 backdrop-blur-xl transition-all duration-200',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-12 items-center px-4">
        <span
          className={cn(
            'font-bold tracking-wider gradient-text',
            collapsed ? 'text-sm' : 'text-lg'
          )}
        >
          {collapsed ? 'C' : 'CORTEX'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {/* Command Center */}
        <NavLink
          item={navItems[0]}
          active={isActive(navItems[0].href)}
          collapsed={collapsed}
        />

        {/* Workstreams section */}
        {!collapsed && (
          <div className="mb-1 mt-4 px-3">
            <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
              Workstreams
            </span>
          </div>
        )}

        {collapsed && <div className="my-2 border-t border-border-subtle" />}

        <div className="space-y-0.5">
          {placeholderWorkstreams.map((ws) => (
            <Link
              key={ws.id}
              href={`/workstreams/${ws.id}`}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-text-secondary transition-all duration-200 hover:bg-accent-500/5 hover:text-text-primary',
                pathname === `/workstreams/${ws.id}` &&
                  'border-l-2 border-accent-500 bg-accent-500/10 text-accent-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
                collapsed && 'justify-center px-0'
              )}
            >
              <span
                className={cn('h-2 w-2 shrink-0 rounded-full shadow-[0_0_6px_currentColor]', ws.color)}
              />
              {!collapsed && <span className="truncate">{ws.name}</span>}
            </Link>
          ))}
        </div>

        {!collapsed && (
          <button
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-text-tertiary transition-colors hover:bg-bg-elevated hover:text-text-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            New Workstream
          </button>
        )}

        {!collapsed && <div className="my-2 border-t border-border-subtle" />}
        {collapsed && <div className="my-2 border-t border-border-subtle" />}

        {/* Remaining nav items */}
        <div className="space-y-0.5">
          {navItems.slice(1).map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border-subtle p-2">
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-tertiary transition-colors hover:bg-bg-elevated hover:text-text-secondary',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Expand sidebar (Cmd+\\)' : 'Collapse sidebar (Cmd+\\)'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="flex-1 text-left text-xs">Collapse</span>
              <kbd className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
                {'\u2318\\'}
              </kbd>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-200',
        active
          ? 'border-l-2 border-accent-500 bg-accent-500/10 text-accent-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
          : 'text-text-secondary hover:bg-accent-500/5 hover:text-text-primary',
        collapsed && 'justify-center px-0'
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
