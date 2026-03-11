import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-bg-elevated text-text-secondary border border-border-subtle',
        'priority-p0':
          'bg-priority-p0/15 text-priority-p0 border border-priority-p0/25',
        'priority-p1':
          'bg-priority-p1/15 text-priority-p1 border border-priority-p1/25',
        'priority-p2':
          'bg-priority-p2/15 text-priority-p2 border border-priority-p2/25',
        'priority-p3':
          'bg-priority-p3/15 text-priority-p3 border border-priority-p3/25',
        'status-success':
          'bg-status-success/15 text-status-success border border-status-success/25',
        'status-warning':
          'bg-status-warning/15 text-status-warning border border-status-warning/25',
        'status-danger':
          'bg-status-danger/15 text-status-danger border border-status-danger/25',
        'status-info':
          'bg-status-info/15 text-status-info border border-status-info/25',
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
