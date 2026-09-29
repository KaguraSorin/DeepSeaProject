'use client';

import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  fullWidth?: boolean;
}

const SIZES = {
  sm: 'px-3.5 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5',
};

/** 渐变按钮：主色 aurora→indigo，hover 位移渐变。 */
export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  function GradientButton(
    {
      children,
      onClick,
      className,
      variant = 'primary',
      size = 'md',
      disabled,
      type = 'button',
      ariaLabel,
      fullWidth,
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200',
          'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45',
          SIZES[size],
          variant === 'primary' && 'btn-gradient text-text-1 shadow-glow',
          variant === 'outline' &&
            'border border-[rgba(147,115,188,0.5)] bg-transparent text-text-1 hover:bg-[rgba(147,115,188,0.16)]',
          variant === 'ghost' && 'bg-[rgba(247,244,255,0.06)] text-text-2 hover:text-text-1 hover:bg-[rgba(247,244,255,0.12)]',
          !disabled && 'active:scale-[0.97]',
          fullWidth && 'w-full',
          className,
        )}
      >
        {children}
      </button>
    );
  },
);