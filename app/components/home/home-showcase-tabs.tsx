import {Image} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';
import {useFetcher} from 'react-router';
import {ProductCard} from '~/components/product-card/product-card';
import type {ProductCardData} from '~/components/product-card/types';
import LocalizedLink from '~/components/ui/localized-link';
import {Slider, SliderContent, SliderFade, SliderNav} from '~/components/ui/slider';

export type ShowcaseTabMeta = {
  id: string;
  label: string;
  href: string;
  image?: {src: string; alt: string} | undefined;
};

const NAV_CIRCLES =
  'gap-ds-xsmall [&_button]:flex [&_button]:size-10 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-full [&_button]:bg-foreground [&_button]:text-background [&_button:disabled]:bg-background [&_button:disabled]:text-muted-foreground';

const CARD_CLASS = 'w-60 shrink-0 snap-start rounded-ds-lg bg-background';

function CardSkeleton() {
  return (
    <div className="flex gap-ds-regular overflow-hidden" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-96 w-60 shrink-0 animate-pulse rounded-ds-lg bg-background" />
      ))}
    </div>
  );
}

// Only the first tab arrives pre-rendered; the rest load on click from /api/showcase/<handle>.
export function HomeShowcaseTabs({
  title,
  subtitle,
  tabs,
  initialProducts,
}: {
  title: string;
  subtitle?: string | undefined;
  tabs: ShowcaseTabMeta[];
  initialProducts: ProductCardData[];
}) {
  const firstId = tabs[0]?.id ?? '';
  const [active, setActive] = useState(firstId);
  const [loaded, setLoaded] = useState<Record<string, ProductCardData[] | null>>({[firstId]: initialProducts});
  const fetcher = useFetcher<{handle: string; products: ProductCardData[]}>();

  useEffect(() => {
    const data = fetcher.data;
    if (!data) return;
    setLoaded((prev) => ({...prev, [data.handle]: data.products.length > 0 ? data.products : null}));
  }, [fetcher.data]);

  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];
  const hasImage = Boolean(current?.image);
  const content = loaded[active];

  function select(id: string) {
    setActive(id);
    if (id in loaded) return;
    void fetcher.load(`/api/showcase/${id}`);
  }

  return (
    <section aria-label={title}>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {subtitle ? <p className="mt-1 text-ds-regular text-muted-foreground">{subtitle}</p> : null}

      <div className={'mt-4 grid overflow-hidden rounded-ds-lg bg-muted ' + (hasImage ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]' : '')}>
        {current?.image ? (
          <div className="relative hidden min-h-80 md:block">
            <Image alt={current.image.alt} className="absolute inset-0 size-full object-cover" sizes="33vw" src={current.image.src} />
          </div>
        ) : null}

        <div className="min-w-0 p-4 md:p-6">
          <div role="tablist" aria-label={title} className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={'home-tab-' + tab.id}
                aria-selected={tab.id === active}
                aria-controls={'home-panel-' + tab.id}
                onClick={() => select(tab.id)}
                className={
                  'cursor-pointer rounded-full px-4 py-2 text-ds-regular font-medium transition-colors ' +
                  (tab.id === active ? 'bg-[#e9e1f7]' : 'bg-background hover:bg-[#e2e5eb]')
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={'home-panel-' + active} aria-labelledby={'home-tab-' + active} className="mt-4">
            {content === undefined ? (
              <CardSkeleton />
            ) : content === null ? (
              <p className="py-ds-large text-ds-regular text-muted-foreground">No products to show right now.</p>
            ) : (
              <Slider key={active} className="[--slider-fade:var(--muted)]">
                <div className="relative min-w-0">
                  <SliderContent className="gap-ds-regular">
                    {content.map((product) => (
                      <ProductCard key={product.id} product={product} compact className={CARD_CLASS} />
                    ))}
                  </SliderContent>
                  <SliderFade side="left" />
                  <SliderFade />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <LocalizedLink href={current?.href ?? '#'} className="text-ds-regular font-medium transition-opacity hover:opacity-70">
                    {'Shop all ' + (current?.label ?? '')}
                  </LocalizedLink>
                  <SliderNav className={NAV_CIRCLES} />
                </div>
              </Slider>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
