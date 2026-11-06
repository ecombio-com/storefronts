// Path: app/routes/($locale).blogs.articles.$articleHandle.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blogs.articles.$articleHandle';
import {ArticlePage} from '~/components/blog/article-page';
import {
  buildBreadcrumbLd,
  buildMeta,
  getBlogAncestors,
  getRelatedArticles,
  readMinutes,
} from '~/lib/blog';
import {
  getAllArticles,
  getArticleByHandle,
  getBlogList,
  getProductsByHandles,
  getUrls,
} from '~/lib/blog.server';
import {addHeadingIds, parseBody, type BodyHeading, type BodySegment} from '~/lib/shortcodes';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Article not found'}];
  const {article} = data;
  return [
    ...buildMeta({
      description: article.seo.description,
      image: article.image?.url ?? new URL('/og-default.png', data.canonicalUrl).href,
      title: article.seo.title,
      type: 'article',
      url: data.canonicalUrl,
    }),
    {'script:ld+json': data.articleLd},
    {'script:ld+json': data.breadcrumbLd},
  ];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const {articleHandle} = params;
  if (!articleHandle) throw new Response('Not found', {status: 404});

  const article = await getArticleByHandle(storefront, articleHandle);
  if (!article) throw new Response('Not found', {status: 404});

  const [blogs, all] = await Promise.all([getBlogList(storefront), getAllArticles(storefront)]);
  const ancestors = getBlogAncestors(article.blogHandle, blogs);

  const headings: BodyHeading[] = [];
  const segments: BodySegment[] = parseBody(article.body ?? '').map((segment) =>
    segment.type === 'html' ? {...segment, html: addHeadingIds(segment.html, headings)} : segment,
  );
  const productHandles = [
    ...new Set(segments.flatMap((s) => (s.type === 'products' ? s.handles.slice(0, 4) : []))),
  ];
  const products = await getProductsByHandles(storefront, productHandles);

  const {abs, canonical} = getUrls(request);
  const crumbs = [
    {name: 'Ecombio', path: '/'},
    {name: 'Journal', path: '/blogs'},
    ...ancestors.map((a) => ({name: a.title, path: `/blogs/category/${a.handle}`})),
    {name: article.blogTitle, path: `/blogs/category/${article.blogHandle}`},
    {name: article.title, path: `/blogs/articles/${article.handle}`},
  ];

  return {
    ancestors,
    article: {...article, body: undefined},
    articleLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.seo.description,
      datePublished: article.publishedAt,
      mainEntityOfPage: canonical,
      ...(article.image ? {image: [article.image.url]} : {}),
      ...(article.authorProfile?.name || article.author
        ? {author: {'@type': 'Person', name: article.authorProfile?.name ?? article.author}}
        : {}),
      publisher: {'@type': 'Organization', name: 'Ecombio'},
    },
    breadcrumbLd: buildBreadcrumbLd(crumbs, abs),
    canonicalUrl: canonical,
    contents: headings.filter((heading) => heading.level === 2),
    minutes: readMinutes(article.body ?? ''),
    products,
    related: getRelatedArticles(article, all, 8).map((a) => ({...a, body: undefined})),
    segments,
  };
}

export default function BlogArticleRoute() {
  const {ancestors, article, contents, minutes, products, related, segments} =
    useLoaderData<typeof loader>();
  return (
    <ArticlePage
      ancestors={ancestors}
      article={article}
      contents={contents}
      minutes={minutes}
      products={products}
      related={related}
      segments={segments}
    />
  );
}
