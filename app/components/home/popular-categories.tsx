import {Image} from '@shopify/hydrogen';
import {useId} from 'react';
import {ImagePlaceholder} from '~/components/ui/image-placeholder';
import LocalizedLink from '~/components/ui/localized-link';
import type {PopularCategory} from '~/lib/home';

export function PopularCategories({title, subtitle, items}: {title: string; subtitle?: string | undefined; items: PopularCategory[]}) {
  const headingId = useId();
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-ds-medium">
      <div className="flex flex-wrap items-baseline gap-x-ds-regular gap-y-ds-xxsmall">
        <h2 id={headingId} className="font-display tracking-tight text-ds-h2 font-semibold">{title}</h2>
        {subtitle ? <p className="text-ds-medium text-muted-foreground">{subtitle}</p> : null}
      </div>
      <ul className="grid grid-cols-1 gap-ds-regular sm:grid-cols-6">
        {items.map((item, index) => (
          <li key={item.label} className={index < 2 ? 'sm:col-span-3' : 'sm:col-span-2'}>
            <LocalizedLink
              href={item.href}
              className="group flex h-full items-center justify-center rounded-ds-lg bg-card p-ds-medium shadow-ds-drop-xs ring-1 ring-border-subtle transition-shadow hover:shadow-ds-drop-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:min-h-80"
            >
              <div className="flex w-fit max-w-full flex-col gap-ds-medium">
                <div className="relative mx-auto size-50">
                  {item.image ? (
                    <Image alt="" className="absolute inset-0 size-full object-contain mix-blend-multiply" sizes="200px" src={item.image} />
                  ) : (
                    <ImagePlaceholder className="size-full rounded-ds-lg bg-muted" iconClassName="text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-ds-xxsmall">
                  <span className="text-ds-medium">{item.label}</span>
                  <span className="text-ds-regular text-muted-foreground">{item.description}</span>
                </div>
              </div>
            </LocalizedLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
