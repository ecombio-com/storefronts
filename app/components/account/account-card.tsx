import type {ReactNode} from 'react';

export function AccountCard({
  action,
  children,
  className = '',
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section className={`flex flex-col gap-4 rounded-ds-md bg-card p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-ds-large font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}