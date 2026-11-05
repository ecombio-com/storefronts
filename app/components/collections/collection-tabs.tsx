// Path: app/components/collections/collection-tabs.tsx
// Products / Expert Advice tabs on standard collection pages. Renders only the products when no articles are linked.
import {useEffect, useId, useState, type ReactNode} from 'react';
import {ArticleCard} from '~/components/blog/article-card';
import type {BlogArticle} from '~/lib/blog';

type Tab = 'products' | 'advice';

const COPY = {
  advice: (count: number) => `Expert Advice (${count})`,
  products: (count?: number) => (count ? `Products (${count})` : 'Products'),
};

const TAB_BASE = '-mb-px border-b-2 px-4 py-3 text-ds-regular font-medium transition-colors';
const TAB_ACTIVE = 'border-foreground text-foreground';
const TAB_IDLE = 'border-transparent text-muted-foreground hover:text-foreground';

export function CollectionTabs({
  articles,
  children,
  productCount,
}: {
  articles: BlogArticle[];
  children: ReactNode;
  productCount?: number;
}) {
  const id = useId();
  const [tab, setTab] = useState<Tab>('products');

  useEffect(() => {
    if (window.location.hash === '#advice') setTab('advice');
  }, []);

  if (articles.length === 0) return <>{children}</>;

  function select(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.hash = next === 'advice' ? 'advice' : '';
    window.history.replaceState(null, '', url);
  }

  return (
    <div className="grid gap-5">
      <div role="tablist" className="flex justify-center border-b">
        <button
          type="button"
          role="tab"
          id={`${id}-products-tab`}
          aria-controls={`${id}-products`}
          aria-selected={tab === 'products'}
          onClick={() => select('products')}
          className={`${TAB_BASE} ${tab === 'products' ? TAB_ACTIVE : TAB_IDLE}`}
        >
          {COPY.products(productCount)}
        </button>
        <button
          type="button"
          role="tab"
          id={`${id}-advice-tab`}
          aria-controls={`${id}-advice`}
          aria-selected={tab === 'advice'}
          onClick={() => select('advice')}
          className={`${TAB_BASE} ${tab === 'advice' ? TAB_ACTIVE : TAB_IDLE}`}
        >
          {COPY.advice(articles.length)}
        </button>
      </div>
      <div
        role="tabpanel"
        id={`${id}-products`}
        aria-labelledby={`${id}-products-tab`}
        hidden={tab !== 'products'}
      >
        {children}
      </div>
      <div
        role="tabpanel"
        id={`${id}-advice`}
        aria-labelledby={`${id}-advice-tab`}
        hidden={tab !== 'advice'}
      >
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={`${article.blogHandle}/${article.handle}`} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
