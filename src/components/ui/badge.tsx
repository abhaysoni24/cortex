import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest font-mono whitespace-nowrap border-2',
  {
    variants: {
      variant: {
        default:
          'bg-bg-elevated text-text-secondary border-2 border-border-default',
        'priority-p0':
          'bg-priority-p0 text-white border-2 border-priority-p0',
        'priority-p1':
          'bg-priority-p1 text-black border-2 border-priority-p1',
        'priority-p2':
          'bg-priority-p2 text-black border-2 border-priority-p2',
        'priority-p3':
          'bg-bg-elevated text-text-tertiary border-2 border-border-default',
        'status-success':
          'bg-status-success text-black border-2 border-status-success',
        'status-warning':
          'bg-status-warning text-black border-2 border-status-warning',
        'status-danger':
          'bg-status-danger text-white border-2 border-status-danger',
        'status-info':
          'bg-status-info text-black border-2 border-status-info',
        'system-offline':
          'bg-bg-elevated text-status-danger border-2 border-status-danger',
        'system-online':
          'bg-bg-elevated text-terminal-400 border-2 border-terminal-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
