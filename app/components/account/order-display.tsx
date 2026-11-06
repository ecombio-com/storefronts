export function humanizeStatus(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'}).format(new Date(iso));
}

export function OrderStatusPill({status}: {status: string}) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-ds-small font-medium text-muted-foreground">
      {humanizeStatus(status)}
    </span>
  );
}