import { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  loadingLabel?: string;
}

const base =
  'inline-flex items-center justify-center gap-2 h-10 min-h-[40px] rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:focus:ring-offset-neutral-900';

const variants = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
  secondary:
    'bg-neutral-700 text-white hover:bg-neutral-600 focus:ring-neutral-500 dark:bg-neutral-600 dark:hover:bg-neutral-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
  ghost:
    'hover:bg-neutral-100 focus:ring-neutral-400 dark:hover:bg-neutral-800 dark:bg-transparent',
};

export function Button({
  children,
  variant = 'primary',
  loading,
  loadingLabel = 'Loading…',
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="h-4 w-4 shrink-0" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
