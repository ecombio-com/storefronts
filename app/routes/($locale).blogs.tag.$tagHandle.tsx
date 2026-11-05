// Path: app/routes/($locale).blogs.tag.$tagHandle.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blogs.tag.$tagHandle';
import {ArticleCard} from '~/components/blog/article-card';
import {LoadMoreGrid} from '~/components/blog/card-row';
import {BlogCrumbs, BlogHeader} from '~/components/blog/journal';
import {Container} from '~/components/ui/container';
import {Page} from '~/components/ui/page';
import {buildMeta, collectTags, tagToHandle} from '~/lib/blog';
import {getAllArticles, getUrls} from '~/lib/blog.server';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Topic not found'}];
  return buildMeta({
    description: `Articles tagged ${data.label}`,
    title: data.label,
    url: data.canonicalUrl,
  });
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const tagHandle = params.tagHandle;
  if (!tagHandle) throw new Response('Not found', {status: 404});
  const all = await getAllArticles(context.storefront);
  const articles = all.filter((a) => a.tags.some((t) => tagToHandle(t) === tagHandle));
  const label = collectTags(articles).find((t) => t.handle === tagHandle)?.label;
  if (!label) throw new Response('Not found', {status: 404});
  return {articles, canonicalUrl: getUrls(request).canonical, label};
}

export default function BlogTagRoute() {
  const {articles, label} = useLoaderData<typeof loader>();
  return (
    <Page className="pt-0">
      <BlogHeader>
        <BlogCrumbs items={[{label: 'Home', href: '/'}, {label: 'Journal', href: '/blogs'}, {label}]} />
        <h1 className="max-w-3xl text-balance font-semibold text-(length:--heading-h2) tracking-tight">
          {label}
        </h1>
        <p className="font-medium text-ds-small">
          {articles.length} {articles.length === 1 ? 'article' : 'articles'}
        </p>
      </BlogHeader>
      <Container className="grid gap-4 py-(--padding-section-medium)">
        <h2 className="text-ds-small uppercase tracking-wide">The latest</h2>
        <LoadMoreGrid
          className="grid gap-(--spacer-medium) sm:grid-cols-2 lg:grid-cols-4"
          items={articles.map((article) => (
            <ArticleCard article={article} category={article.blogTitle} compact key={article.handle} />
          ))}
          pageSize={8}
        />
      </Container>
    </Page>
  );
}
