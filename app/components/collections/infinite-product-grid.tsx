// Path: app/components/collections/infinite-product-grid.tsx
// Remount with key={location.search} so a filter or sort change starts a fresh list.
import {LoaderCircleIcon} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {useFetcher, useLocation} from 'react-router';
import {ProductCard} from '~/components/product-card/product-card';
import type {ProductCardData} from '~/components/product-card/types';

type PageInfo = {hasNextPage: boolean; endCursor?: string | null};

export function InfiniteProductGrid({
  initialPageInfo,
  initialProducts,
  showSale = false,
  variant = 'minimal',
}: {
  initialPageInfo: PageInfo;
  initialProducts: ProductCardData[];
  showSale?: boolean;
  variant?: 'default' | 'minimal';
}) {
  const fetcher = useFetcher<{pageInfo: PageInfo; products: ProductCardData[]}>();
  const location = useLocation();
  const sentinel = useRef<HTMLDivElement>(null);
  const [extra, setExtra] = useState<ProductCardData[]>([]);
  const pageInfo = fetcher.data?.pageInfo ?? initialPageInfo;

  useEffect(() => {
    const data = fetcher.data;
    if (!data) return;
    setExtra((prev) => {
      const seen = new Set([...initialProducts, ...prev].map((p) => p.id));
      return [...prev, ...data.products.filter((p) => !seen.has(p.id))];
    });
  }, [fetcher.data, initialProducts]);

  const {endCursor, hasNextPage} = pageInfo;
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage || !endCursor || fetcher.state !== 'idle') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const params = new URLSearchParams(location.search);
        params.set('cursor', endCursor);
        fetcher.load(`${location.pathname}?${params.toString()}`);
      },
      {rootMargin: '400px'},
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endCursor, hasNextPage, fetcher.state, location.pathname, location.search]);

  return (
    <>
      <div className="grid grid-cols-2 gap-(--grid-gutter) sm:grid-cols-3 lg:grid-cols-3 [&_[data-slot=product-card-image]]:aspect-5/4">
        {[...initialProducts, ...extra].map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={variant}
            showSale={showSale}
            loading={index < 6 ? 'eager' : undefined}
          />
        ))}
      </div>
      {hasNextPage ? (
        <div ref={sentinel} className="flex justify-center py-10">
          {fetcher.state !== 'idle' ? (
            <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
