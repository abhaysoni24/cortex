'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-accent-600 to-pink-500 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4),0_0_40px_rgba(236,72,153,0.2)] active:from-accent-700 active:to-pink-600',
        secondary:
          'bg-bg-elevated/80 backdrop-blur-sm text-text-primary border border-accent-500/25 hover:border-accent-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:bg-bg-overlay/80',
        ghost:
          'bg-transparent text-text-secondary hover:bg-accent-500/10 hover:text-text-primary hover:shadow-[0_0_10px_rgba(168,85,247,0.1)]',
        danger:
          'bg-gradient-to-r from-status-danger to-[#DC2626] text-white hover:shadow-[0_0_20px_rgba(248,113,113,0.4)] active:opacity-90',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs rounded',
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
