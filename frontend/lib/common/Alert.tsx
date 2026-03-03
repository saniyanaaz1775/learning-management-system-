export function Alert({
  children,
  variant = 'info',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'info' | 'error' | 'success';
  className?: string;
}) {
  const styles = {
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    error: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 border-red-200 dark:border-red-800',
    success: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800',
  };
  return (
    <div
      className={`rounded-md border px-4 py-3 ${styles[variant]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
}
