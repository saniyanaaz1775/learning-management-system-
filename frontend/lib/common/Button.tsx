import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  loading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary:
      'bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
    secondary:
      'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
    ghost:
      'hover:bg-neutral-100 focus:ring-neutral-500 dark:hover:bg-neutral-800',
  };
  return (
    <button
      type={props.type ?? 'button'}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
