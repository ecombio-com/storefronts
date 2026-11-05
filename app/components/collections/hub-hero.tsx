// Path: app/components/collections/hub-hero.tsx
import {Suspense} from 'react';
import {Await} from 'react-router';
import {ProductCard} from '~/components/product-card/product-card';
import type {ProductCardData} from '~/components/product-card/types';
import LocalizedLink from '~/components/ui/localized-link';
import type {HubHeroContent, HubSubCollection} from '~/lib/collection-hub';
import {shopifyImageSrcSet, shopifyImageUrl} from '~/lib/image-url';

// Tilted product photos on the hero background. Positions are percentages of the hero.
const SLOTS = [
  {left: '30%', top: '3%', width: '24%', rotate: -10},
  {left: '53%', top: '8%', width: '20%', rotate: 9},
  {left: '32%', top: '50%', width: '24%', rotate: 6},
  {left: '55%', top: '54%', width: '20%', rotate: -7},
];

export function HubHero({
  featured,
  hero,
  subCollections,
}: {
  featured: Promise<ProductCardData | null>;
  hero: HubHeroContent;
  subCollections: HubSubCollection[];
}) {
  const scatter = subCollections
    .slice(0, SLOTS.length)
    .flatMap((sub) => (sub.productImage ? [{handle: sub.handle, image: sub.productImage}] : []));

  return (
    <section
      aria-label={hero.title}
      className="relative isolate flex min-h-[26rem] overflow-hidden rounded-ds-lg bg-[#111016] md:min-h-[38rem]"
    >
      {hero.image ? (
        <>
          <img
            alt={hero.image.alt}
            className="absolute inset-0 -z-10 size-full object-cover"
            {...{fetchpriority: 'high'}}
            loading="eager"
            sizes="100vw"
            src={shopifyImageUrl(hero.image.src, 1600)}
            srcSet={shopifyImageSrcSet(hero.image.src, [800, 1200, 1600, 2000])}
          />
          {scatter.length > 0 ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
            >
              {scatter.map((item, i) => {
                const slot = SLOTS[i];
                if (!slot) return null;
                return (
                  <div
                    key={item.handle}
                    className="absolute aspect-[4/3]"
                    style={{
                      left: slot.left,
                      top: slot.top,
                      width: slot.width,
                      transform: `rotate(${slot.rotate}deg)`,
                    }}
                  >
                    <img
                      alt=""
                      className="absolute inset-0 size-full object-contain mix-blend-multiply"
                      decoding="async"
                      loading="lazy"
                      sizes="25vw"
                      src={shopifyImageUrl(item.image.src, 500)}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111016] via-[#111016]/70 to-transparent"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111016] via-[#2f3a22] to-[#c8e35a]"
        />
      )}

      <div className="flex w-full flex-col gap-8 p-8 text-white md:p-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-xl flex-col gap-4">
          {hero.eyebrow ? <p className="text-ds-regular">{hero.eyebrow}</p> : null}
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {hero.title}
          </h2>
          {hero.body ? <p className="max-w-md text-lg leading-7">{hero.body}</p> : null}
          <LocalizedLink
            href={hero.href}
            className="mt-4 inline-flex w-fit items-center rounded-ds-lg bg-white px-6 py-4 text-ds-regular font-medium text-black transition-opacity hover:opacity-90"
          >
            {hero.ctaLabel}
          </LocalizedLink>
        </div>

        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <Await resolve={featured}>
              {(product) =>
                product ? (
                  <div className="w-72 rounded-ds-lg bg-background p-2 text-foreground shadow-lg">
                    <ProductCard product={product} outOfStockText="Out of Stock" />
                  </div>
                ) : null
              }
            </Await>
          </Suspense>
        </div>
      </div>
    </section>
  );
}
