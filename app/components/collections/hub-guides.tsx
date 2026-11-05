// Path: app/components/collections/hub-guides.tsx
// Guides carousel on hub pages, from the collection metafield custom.hub_guides.
import LocalizedLink from '~/components/ui/localized-link';
import type {HubGuide} from '~/lib/collection-hub';
import {shopifyImageSrcSet, shopifyImageUrl} from '~/lib/image-url';
import {DealsCarousel} from './deals-carousel';

const COPY = {label: 'Guide', title: 'Guides and advice'};

export function HubGuides({guides}: {guides: HubGuide[]}) {
  if (guides.length === 0) return null;
  return (
    <DealsCarousel title={COPY.title}>
      {guides.map((guide) => (
        <LocalizedLink
          key={guide.id}
          href={guide.href}
          className="flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-ds-lg bg-card shadow-ds-drop-xs ring-1 ring-border-subtle transition-shadow hover:shadow-ds-drop-sm focus-visible:shadow-ds-drop-sm"
        >
          <div className="relative aspect-4/3 w-full overflow-hidden bg-secondary">
            {guide.image ? (
              <img
                alt={guide.image.alt}
                className="absolute inset-0 size-full object-cover"
                decoding="async"
                loading="lazy"
                sizes="256px"
                src={shopifyImageUrl(guide.image.src, 512)}
                srcSet={shopifyImageSrcSet(guide.image.src, [256, 512])}
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-1 p-5">
            <p className="text-ds-regular text-muted-foreground">{COPY.label}</p>
            <p className="line-clamp-2 text-ds-medium font-medium leading-snug text-foreground">
              {guide.title}
            </p>
          </div>
        </LocalizedLink>
      ))}
    </DealsCarousel>
  );
}
