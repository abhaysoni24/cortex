import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'bg-bg-elevated/80 backdrop-blur-sm text-text-secondary border border-accent-500/20',
        'priority-p0':
          'bg-priority-p0/20 text-priority-p0 border border-priority-p0/40 shadow-[0_0_8px_rgba(255,71,87,0.2)]',
        'priority-p1':
          'bg-priority-p1/20 text-priority-p1 border border-priority-p1/40 shadow-[0_0_8px_rgba(255,165,2,0.2)]',
        'priority-p2':
          'bg-priority-p2/20 text-priority-p2 border border-priority-p2/40 shadow-[0_0_8px_rgba(55,66,250,0.2)]',
        'priority-p3':
          'bg-priority-p3/20 text-priority-p3 border border-priority-p3/40',
        'status-success':
          'bg-status-success/20 text-status-success border border-status-success/40 shadow-[0_0_8px_rgba(52,211,153,0.15)]',
        'status-warning':
          'bg-status-warning/20 text-status-warning border border-status-warning/40 shadow-[0_0_8px_rgba(251,191,36,0.15)]',
        'status-danger':
          'bg-status-danger/20 text-status-danger border border-status-danger/40 shadow-[0_0_8px_rgba(248,113,113,0.15)]',
        'status-info':
          'bg-status-info/20 text-status-info border border-status-info/40 shadow-[0_0_8px_rgba(96,165,250,0.15)]',
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
