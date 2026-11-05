// Path: app/components/blog/article-card.tsx
import {ImagePlaceholder} from '~/components/ui/image-placeholder';
import Link from '~/components/ui/localized-link';
import {sizedImage, type BlogArticle} from '~/lib/blog';

const LOCALE = 'en-US';

function CardImage({article, width}: {article: BlogArticle; width: number}) {
  return article.image ? (
    <img
      alt={article.image.altText}
      src={sizedImage(article.image.url, width)}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 size-full object-cover"
    />
  ) : (
    <ImagePlaceholder className="size-full bg-muted" />
  );
}

export function ArticleCard({
  article,
  category,
  compact = false,
  showDate = false,
}: {
  article: BlogArticle;
  /** Category label above the title (compact layout only). */
  category?: string;
  /** Tile layout: image, category and title only. */
  compact?: boolean;
  /** Compact layout only: show the publish date above the title. */
  showDate?: boolean;
}) {
  const href = `/blogs/articles/${article.handle}`;

  if (compact) {
    return (
      <article className="grid content-start overflow-hidden rounded-ds-lg bg-(--color-bg-secondary) shadow-(--shadow-drop-xs)">
        <Link className="relative aspect-16/10 overflow-hidden" href={href}>
          <CardImage article={article} width={640} />
        </Link>
        <div className="grid gap-(--spacer-xsmall) p-(--spacer-regular)">
          {category ? <p className="text-muted-foreground text-ds-small">{category}</p> : null}
          {showDate ? (
            <time className="text-muted-foreground text-ds-small" dateTime={article.publishedAt}>
              {new Intl.DateTimeFormat(LOCALE, {dateStyle: 'medium'}).format(
                new Date(article.publishedAt),
              )}
            </time>
          ) : null}
          <h3 className="line-clamp-3 font-semibold text-ds-regular leading-snug">
            <Link className="transition-opacity hover:opacity-70" href={href}>
              {article.title}
            </Link>
          </h3>
        </div>
      </article>
    );
  }

  const publishedAt = new Intl.DateTimeFormat(LOCALE, {dateStyle: 'long'}).format(
    new Date(article.publishedAt),
  );
  return (
    <article className="grid content-start gap-4">
      <Link className="relative aspect-3/2 overflow-hidden rounded-ds-lg" href={href}>
        <CardImage article={article} width={800} />
      </Link>
      <div className="grid gap-2.5">
        <time className="text-muted-foreground text-ds-regular" dateTime={article.publishedAt}>
          {publishedAt}
        </time>
        <h2 className="font-medium text-ds-medium tracking-tight">
          <Link className="transition-opacity hover:opacity-70" href={href}>
            {article.title}
          </Link>
        </h2>
        {article.excerpt ? (
          <p className="text-muted-foreground text-ds-regular leading-6 line-clamp-3">
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}
