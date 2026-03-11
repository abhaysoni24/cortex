import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md border border-border-subtle bg-bg-surface/80 backdrop-blur-sm p-3 transition-all duration-200 hover:bg-bg-elevated/80 hover:border-accent-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.08)]',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export { Card };
