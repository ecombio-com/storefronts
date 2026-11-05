// Path: app/components/blog/article-page.tsx
import {ArticleBody} from '~/components/blog/article-body';
import {ArticleCard} from '~/components/blog/article-card';
import {ArticleToc, BackToTop, ReadingProgress, ShareButton} from '~/components/blog/article-widgets';
import {AuthorCard} from '~/components/blog/author';
import {CardRow} from '~/components/blog/card-row';
import {BlogCrumbs, BlogHeader} from '~/components/blog/journal';
import type {ProductCardData} from '~/components/product-card/types';
import {Container} from '~/components/ui/container';
import Link from '~/components/ui/localized-link';
import {Page} from '~/components/ui/page';
import {sizedImage, tagToHandle, type BlogArticle, type BlogListItem} from '~/lib/blog';
import type {BodySegment} from '~/lib/shortcodes';

export function ArticlePage({
  ancestors,
  article,
  contents,
  minutes,
  products,
  related,
  segments,
}: {
  ancestors: BlogListItem[];
  article: BlogArticle;
  contents: Array<{id: string; text: string}>;
  minutes: number;
  products: Record<string, ProductCardData>;
  related: BlogArticle[];
  segments: BodySegment[];
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {dateStyle: 'long'}).format(
    new Date(article.publishedAt),
  );
  const profile = article.authorProfile;
  const authorName = profile?.name ?? article.author;

  return (
    <Page className="pt-0">
      <BlogHeader>
        <BlogCrumbs
          items={[
            {label: 'Home', href: '/'},
            {label: 'Journal', href: '/blogs'},
            ...ancestors.map((a) => ({label: a.title, href: `/blogs/category/${a.handle}`})),
            {label: article.blogTitle, href: `/blogs/category/${article.blogHandle}`},
            {label: article.title},
          ]}
        />
        <h1 className="max-w-3xl text-balance text-left font-semibold text-(length:--heading-h2) tracking-tight">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center justify-start gap-x-(--spacer-medium) gap-y-(--spacer-small) text-ds-small">
          {authorName ? (
            <div className="flex items-center gap-(--spacer-small) text-left">
              {profile?.photo ? (
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
                  <img
                    alt={profile.photo.altText || authorName}
                    className="absolute inset-0 size-full object-cover"
                    src={sizedImage(profile.photo.url, 80)}
                  />
                </span>
              ) : null}
              <span className="grid">
                {profile?.handle ? (
                  <Link
                    className="font-semibold transition-opacity hover:opacity-70"
                    href={`/blogs/author/${profile.handle}`}
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-semibold">{authorName}</span>
                )}
                {profile?.role ? <span>{profile.role}</span> : null}
              </span>
            </div>
          ) : null}
          <time dateTime={article.publishedAt}>Published on {publishedAt}</time>
          <span>{minutes} min read</span>
          <ShareButton title={article.title} />
        </div>
      </BlogHeader>

      <Container className="py-(--padding-section-medium)">
        <div
          className="grid content-start gap-12 [&_h2]:scroll-mt-28 [&_h3]:scroll-mt-28"
          data-article-body
        >
          <ArticleBody products={products} segments={segments} />
          {article.tags.length > 0 ? (
            <ul className="flex max-w-3xl flex-wrap gap-(--spacer-small)">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    className="rounded-full bg-(--color-bg-secondary) px-(--spacer-regular) py-(--spacer-xsmall) font-medium text-ds-small shadow-(--shadow-drop-xs) transition-opacity hover:opacity-70"
                    href={`/blogs/tag/${tagToHandle(tag)}`}
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {profile ? (
            <div className="max-w-3xl">
              <AuthorCard profile={profile} />
            </div>
          ) : null}
        </div>
      </Container>

      {related.length > 0 ? (
        <Container className="pb-(--padding-section-medium)">
          <CardRow id="related-articles" title="Related articles">
            {related.map((other) => (
              <ArticleCard article={other} category={other.blogTitle} compact key={other.handle} />
            ))}
          </CardRow>
        </Container>
      ) : null}

      <ArticleToc items={contents} />
      <ReadingProgress />
      <BackToTop />
    </Page>
  );
}
