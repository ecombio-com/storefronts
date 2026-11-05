// Path: app/components/collections/hub-articles.tsx
import LocalizedLink from '~/components/ui/localized-link';
import type {HubArticle} from '~/lib/collection-hub';
import {shopifyImageSrcSet, shopifyImageUrl} from '~/lib/image-url';

export function HubArticles({articles}: {articles: HubArticle[]}) {
  const items = articles.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section aria-label="Guides and advice">
      <h2 className="text-center font-display text-3xl font-semibold tracking-tight md:text-5xl">
        But wait &mdash; there&rsquo;s more.
      </h2>
      <ul className="mt-8 grid items-stretch gap-6 md:grid-cols-3">
        {items.map((article) => {
          const href = `/blogs/articles/${article.handle}`;
          return (
            <li
              key={article.id}
              className="flex h-full flex-col gap-4 overflow-hidden rounded-ds-lg bg-white p-4 shadow-ds-drop-xs ring-1 ring-black/5 transition-shadow hover:shadow-ds-drop-sm focus-within:shadow-ds-drop-sm"
            >
              <LocalizedLink
                className="relative block aspect-3/2 w-full overflow-hidden rounded-ds-md bg-muted"
                href={href}
              >
                {article.image ? (
                  <img
                    alt={article.image.alt}
                    className="absolute inset-0 size-full object-cover"
                    decoding="async"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    src={shopifyImageUrl(article.image.src, 600)}
                    srcSet={shopifyImageSrcSet(article.image.src, [400, 600, 900])}
                  />
                ) : null}
              </LocalizedLink>
              <div className="grid content-start gap-2">
                <h3 className="line-clamp-2 min-h-[2.75rem] font-medium text-ds-medium tracking-tight">
                  {article.title}
                </h3>
                <p className="line-clamp-2 min-h-12 text-ds-regular leading-6 text-muted-foreground">
                  {article.excerpt}
                </p>
              </div>
              <LocalizedLink
                className="mt-auto inline-flex h-12 w-full items-center justify-center rounded-ds-md bg-foreground px-5 text-ds-regular font-medium text-background transition-opacity hover:opacity-90"
                href={href}
              >
                Read article
              </LocalizedLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
