import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-border-default bg-bg-elevated px-1.5 font-mono text-[10px] font-medium text-text-tertiary',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { Kbd };
