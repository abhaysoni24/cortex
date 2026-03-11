'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, title, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full flex-col rounded-md border border-border-subtle bg-bg-surface',
          className
        )}
        {...props}
      >
        {(title || actions) && (
          <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-3 py-2">
            {title && (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {title}
              </h3>
            )}
            {actions && <div className="flex items-center gap-1">{actions}</div>}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-3">{children}</div>
      </div>
    );
  }
);
Panel.displayName = 'Panel';

export { Panel };
