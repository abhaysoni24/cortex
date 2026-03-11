'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold uppercase tracking-wider font-mono border-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-accent-500 text-black border-2 border-accent-600 hover:bg-accent-400',
        secondary:
          'bg-bg-elevated text-text-primary border-2 border-border-default hover:border-accent-500 hover:text-accent-500',
        ghost:
          'bg-transparent text-text-secondary border-2 border-transparent hover:bg-bg-elevated hover:text-text-primary hover:border-border-default',
        danger:
          'bg-status-danger text-white border-2 border-alert-500 hover:bg-alert-400',
        terminal:
          'bg-transparent text-terminal-400 border-2 border-terminal-400 hover:bg-terminal-400/10',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs rounded-none',
        default: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
