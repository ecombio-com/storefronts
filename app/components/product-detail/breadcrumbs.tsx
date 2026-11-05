import {cn} from 'cn';
import type {ComponentProps} from 'react';
import {ChevronRightIcon} from '~/components/ui/icons';
import LocalizedLink from '~/components/ui/localized-link';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function Breadcrumbs({
  items,
  className,
  ...props
}: {items: BreadcrumbItem[]} & ComponentProps<'nav'>) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm font-medium', className)} {...props}>
      <ol className="flex min-w-0 items-center gap-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.name}-${index}`}
              className={cn('flex items-center gap-3', isLast ? 'min-w-0' : 'shrink-0')}
            >
              {item.path && !isLast ? (
                <LocalizedLink
                  href={item.path}
                  className="text-foreground transition-colors hover:underline"
                >
                  {item.name}
                </LocalizedLink>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(isLast && 'block truncate text-primary')}
                >
                  {item.name}
                </span>
              )}
              {!isLast ? (
                <ChevronRightIcon
                  className="size-3.5 shrink-0 text-foreground/60"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}