// Path: app/components/collections/collection-sections.tsx
// Deferred sections shared by the hub and standard collection pages.
// Each shows nothing while loading, when empty, and on failure.
import {Suspense} from 'react';
import {Await} from 'react-router';
import {CollectionReviews, type YotpoCollectionReviews} from '~/@yotpo';
import {ArticleBody} from '~/components/blog/article-body';
import {ProductCard} from '~/components/product-card/product-card';
import type {ProductCardData} from '~/components/product-card/types';
import type {AfterItemPage} from '~/lib/collection-hub';
import {parseBody} from '~/lib/shortcodes';
import {DealsCarousel} from './deals-carousel';

const COPY = {
  deals: (title: string) => `${title} deals`,
  outOfStock: 'Out of Stock',
};

export function DealsSection({deals, title}: {deals: Promise<ProductCardData[]>; title: string}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={deals} errorElement={null}>
        {(products) =>
          products.length > 0 ? (
            <DealsCarousel title={COPY.deals(title)}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  outOfStockText={COPY.outOfStock}
                  className="w-60 shrink-0 snap-start"
                />
              ))}
            </DealsCarousel>
          ) : null
        }
      </Await>
    </Suspense>
  );
}

export function ReviewsSection({
  reviews,
  title,
}: {
  reviews: Promise<YotpoCollectionReviews | null>;
  title: string;
}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={reviews} errorElement={null}>
        {(data) => <CollectionReviews collectionTitle={title} data={data} />}
      </Await>
    </Suspense>
  );
}

// Product shortcodes in the page body render empty for now (no products passed).
export function AfterItemList({page}: {page: AfterItemPage | null}) {
  if (!page?.body.trim()) return null;
  return (
    <section aria-label={page.title} className="mt-4 border-t pt-6">
      <div className="w-full [&_article]:max-w-none [&>div]:gap-3 [&_h2]:mt-0 [&_h2]:mb-2 [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:my-2 [&_ul]:my-2 [&_li]:my-0.5">
        <ArticleBody products={{}} segments={parseBody(page.body)} />
      </div>
    </section>
  );
}

export function DeferredAfterItemList({page}: {page: Promise<AfterItemPage | null>}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={page} errorElement={null}>
        {(resolved) => <AfterItemList page={resolved} />}
      </Await>
    </Suspense>
  );
}
