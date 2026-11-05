// Path: app/routes/($locale).blogs.category.$categoryHandle.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blogs.category.$categoryHandle';
import {ArticleCard} from '~/components/blog/article-card';
import {CardRow} from '~/components/blog/card-row';
import {BlogCrumbs, BlogHeader} from '~/components/blog/journal';
import {Container} from '~/components/ui/container';
import Link from '~/components/ui/localized-link';
import {Page} from '~/components/ui/page';
import {
  buildBreadcrumbLd,
  buildMeta,
  collectTags,
  getBlogAncestors,
  getCategoryCopy,
  tagToHandle,
} from '~/lib/blog';
import {getBlog, getBlogList, getUrls} from '~/lib/blog.server';

// A tag needs at least this many articles to get its own row.
const MIN_ROW = 2;
const MAX_ROWS = 6;
const VIEW_ALL =
  'inline-flex items-center gap-(--spacer-xsmall) rounded-full bg-(--color-text-dark) px-(--spacer-medium) py-(--spacer-small) font-medium text-(--color-text-light) text-ds-small transition-opacity hover:opacity-80';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Category not found'}];
  return [
    ...buildMeta({description: data.description, title: data.title, url: data.canonicalUrl}),
    {'script:ld+json': data.breadcrumbLd},
  ];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const handle = params.categoryHandle;
  if (!handle) throw new Response('Not found', {status: 404});

  const [blog, blogs] = await Promise.all([getBlog(storefront, handle), getBlogList(storefront)]);
  if (!blog) throw new Response('Not found', {status: 404});

  const ancestors = getBlogAncestors(blog.handle, blogs);
  const copy = getCategoryCopy(blog.handle);
  const allTags = collectTags(blog.articles);

  // One row per tag. Skip tags that cover every article (they add nothing) and thin tags.
  const rows = allTags
    .filter((tag) => tag.count >= MIN_ROW && tag.count < blog.articles.length)
    .slice(0, MAX_ROWS)
    .map((tag) => ({
      articles: blog.articles.filter((a) => a.tags.some((l) => tagToHandle(l) === tag.handle)),
      tag,
    }));
  const shown = new Set(rows.flatMap((row) => row.articles.map((a) => a.handle)));
  const leftovers = blog.articles.filter((a) => !shown.has(a.handle));

  const {abs, canonical} = getUrls(request);
  return {
    allTags,
    ancestors,
    blog: {handle: blog.handle, title: blog.title, total: blog.articles.length},
    blogs,
    breadcrumbLd: buildBreadcrumbLd(
      [
        {name: 'Home', path: '/'},
        {name: 'Journal', path: '/blogs'},
        ...ancestors.map((a) => ({name: a.title, path: `/blogs/category/${a.handle}`})),
        {name: blog.title, path: `/blogs/category/${blog.handle}`},
      ],
      abs,
    ),
    canonicalUrl: canonical,
    description:
      copy?.description ||
      blog.seo.description ||
      `The latest ${blog.title} articles, guides and stories from Ecombio.`,
    leftovers,
    rows,
    subtitle: copy?.subtitle ?? `The latest ${blog.title} articles, guides and stories.`,
    title: copy?.title ?? blog.seo.title,
  };
}

export default function BlogCategoryRoute() {
  const {allTags, ancestors, blog, blogs, leftovers, rows, subtitle} =
    useLoaderData<typeof loader>();
  return (
    <Page className="pt-0">
      <BlogHeader>
        <BlogCrumbs
          items={[
            {label: 'Home', href: '/'},
            {label: 'Journal', href: '/blogs'},
            ...ancestors.map((a) => ({label: a.title, href: `/blogs/category/${a.handle}`})),
            {label: blog.title},
          ]}
        />
        <h1 className="max-w-3xl text-balance font-semibold text-(length:--heading-h2) tracking-tight">
          {blog.title}
        </h1>
        <p className="max-w-2xl text-(length:--text-regular)">{subtitle}</p>
      </BlogHeader>

      <Container className="pt-(--spacer-regular)">
        {rows.map(({articles, tag}) => (
          <CardRow
            action={
              <Link className={VIEW_ALL} href={`/blogs/tag/${tag.handle}`}>
                {tag.label}
                <span aria-hidden="true">→</span>
              </Link>
            }
            id={`tag-${tag.handle}`}
            key={tag.handle}
            title={tag.label}
          >
            {articles.map((article) => (
              <ArticleCard article={article} category={blog.title} compact key={article.handle} />
            ))}
          </CardRow>
        ))}

        {leftovers.length > 0 ? (
          <CardRow id="more" title={rows.length > 0 ? `More from ${blog.title}` : blog.title}>
            {leftovers.map((article) => (
              <ArticleCard article={article} category={blog.title} compact key={article.handle} />
            ))}
          </CardRow>
        ) : null}

        {blog.total === 0 ? (
          <p className="py-(--padding-section-medium) text-center text-muted-foreground">
            No articles found.
          </p>
        ) : null}

        <section aria-labelledby="all-articles-title" className="py-(--padding-section-medium)">
          <h2 className="font-semibold text-ds-medium" id="all-articles-title">
            See all articles
          </h2>
          <div className="mt-(--spacer-large) grid grid-cols-2 gap-(--grid-gutter) md:grid-cols-4">
            <div className="grid content-start gap-(--spacer-small)">
              <h3 className="font-semibold text-ds-regular">Categories</h3>
              <ul className="grid gap-(--spacer-xsmall) text-muted-foreground text-ds-small">
                {blogs.map((b) => (
                  <li key={b.handle}>
                    <Link className="hover:text-foreground" href={`/blogs/category/${b.handle}`}>
                      {b.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {allTags.length > 0 ? (
              <div className="grid content-start gap-(--spacer-small)">
                <h3 className="font-semibold text-ds-regular">Topics</h3>
                <ul className="grid gap-(--spacer-xsmall) text-muted-foreground text-ds-small">
                  {allTags.map((tag) => (
                    <li key={tag.handle}>
                      <Link className="hover:text-foreground" href={`/blogs/tag/${tag.handle}`}>
                        {tag.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      </Container>
    </Page>
  );
}
