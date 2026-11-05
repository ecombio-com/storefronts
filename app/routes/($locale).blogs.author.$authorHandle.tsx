// Path: app/routes/($locale).blogs.author.$authorHandle.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blogs.author.$authorHandle';
import {ArticleCard} from '~/components/blog/article-card';
import {AuthorBadge, RichText} from '~/components/blog/author';
import {LoadMoreGrid} from '~/components/blog/card-row';
import {BlogCrumbs, BlogHeader} from '~/components/blog/journal';
import {Container} from '~/components/ui/container';
import Link from '~/components/ui/localized-link';
import {Page} from '~/components/ui/page';
import {authorKey, buildMeta, collectTags, sizedImage} from '~/lib/blog';
import {getAllArticles, getUrls} from '~/lib/blog.server';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Author not found'}];
  return buildMeta({
    description: data.profile.bio ?? `Articles by ${data.profile.name}`,
    title: data.profile.name,
    url: data.canonicalUrl,
  });
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const authorHandle = params.authorHandle;
  if (!authorHandle) throw new Response('Not found', {status: 404});
  const all = await getAllArticles(context.storefront);
  const articles = all.filter((a) => authorKey(a) === authorHandle);
  const newest = articles[0];
  if (!newest) throw new Response('Not found', {status: 404});
  const profile = articles.find((a) => a.authorProfile)?.authorProfile ?? {
    name: newest.author ?? authorHandle,
  };
  return {
    articles,
    canonicalUrl: getUrls(request).canonical,
    profile,
    topics: collectTags(articles).slice(0, 12),
  };
}

export default function BlogAuthorRoute() {
  const {articles, profile, topics} = useLoaderData<typeof loader>();
  return (
    <Page className="pt-0">
      <BlogHeader>
        <BlogCrumbs
          items={[{label: 'Home', href: '/'}, {label: 'Journal', href: '/blogs'}, {label: profile.name}]}
        />
        <div className="flex flex-wrap items-start gap-(--spacer-medium)">
          {profile.photo ? (
            <div className="relative size-24 shrink-0">
              <div className="relative size-full overflow-hidden rounded-full bg-muted">
                <img
                  alt={profile.photo.altText || profile.name}
                  className="absolute inset-0 size-full object-cover"
                  src={sizedImage(profile.photo.url, 192)}
                />
              </div>
              <AuthorBadge className="absolute bottom-0 left-1/2 size-6 -translate-x-1/2 translate-y-1/3 rounded-full" />
            </div>
          ) : null}
          <div className="grid max-w-3xl min-w-0 gap-(--spacer-small)">
            <h1 className="font-semibold text-(length:--heading-h2) tracking-tight">{profile.name}</h1>
            {profile.role ? <p className="text-ds-regular">{profile.role}</p> : null}
            <p className="font-medium text-ds-small">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </p>
            {profile.bio ? (
              <div className="whitespace-pre-line text-ds-regular leading-6">
                <RichText value={profile.bio} />
              </div>
            ) : null}
          </div>
        </div>
      </BlogHeader>

      <Container className="grid gap-10 py-(--padding-section-medium)">
        {topics.length > 0 ? (
          <section className="grid gap-3">
            <h2 className="text-ds-small uppercase tracking-wide">Topics</h2>
            <ul className="flex flex-wrap gap-(--spacer-small)">
              {topics.map((tag) => (
                <li key={tag.handle}>
                  <Link
                    className="rounded-full bg-(--color-bg-secondary) px-(--spacer-regular) py-(--spacer-xsmall) font-medium text-ds-small shadow-(--shadow-drop-xs) transition-opacity hover:opacity-70"
                    href={`/blogs/tag/${tag.handle}`}
                  >
                    {tag.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="grid gap-4">
          <h2 className="text-ds-small uppercase tracking-wide">Latest from {profile.name}</h2>
          <LoadMoreGrid
            className="grid gap-(--spacer-medium) sm:grid-cols-2 lg:grid-cols-4"
            items={articles.map((article) => (
              <ArticleCard
                article={article}
                category={article.blogTitle}
                compact
                key={article.handle}
                showDate
              />
            ))}
            pageSize={8}
          />
        </section>
      </Container>
    </Page>
  );
}
