// Path: app/lib/blog.server.ts
// Shopify blog queries. Server only. Cached with CacheLong, in place of Next's "use cache" tags.
import type {Storefront} from '@shopify/hydrogen';
import type {ProductCardData} from '~/components/product-card/types';
import {
  transformArticle,
  type Blog,
  type BlogArticle,
  type BlogListItem,
  type RawArticle,
} from '~/lib/blog';
import {getLocaleFromRequest} from '~/lib/i18n';
import {PRODUCT_CARD_FRAGMENT, toProductCardData} from '~/lib/product-card';

const JOURNAL_ARTICLE_FRAGMENT = `#graphql
  fragment JournalArticle on Article {
    authorV2 {
      name
    }
    content(truncateAt: 240)
    excerpt
    handle
    image {
      altText
      height
      url
      width
    }
    publishedAt
    title
    tags
    seo {
      description
      title
    }
    authorProfile: metafield(namespace: "custom", key: "author_profile") {
      reference {
        ... on Metaobject {
          handle
          name: field(key: "name") { value }
          role: field(key: "role") { value }
          bio: field(key: "bio") { value }
          photo: field(key: "photo") {
            reference {
              ... on MediaImage {
                image { url altText width height }
              }
            }
          }
        }
      }
    }
  }
` as const;

const BLOG_LIST_QUERY = `#graphql
  query JournalBlogList($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    blogs(first: 25) {
      nodes {
        handle
        title
        parentBlog: metafield(namespace: "custom", key: "parent_blog") { value }
      }
    }
  }
` as const;

const BLOG_QUERY = `#graphql
  query JournalBlog($handle: String!, $first: Int!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    blog(handle: $handle) {
      handle
      title
      seo {
        description
        title
      }
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...JournalArticle
        }
      }
    }
  }
  ${JOURNAL_ARTICLE_FRAGMENT}
` as const;

const ARTICLE_BY_HANDLE_QUERY = `#graphql
  query JournalArticleByHandle($articleHandle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    blogs(first: 25) {
      nodes {
        handle
        title
        articleByHandle(handle: $articleHandle) {
          ...JournalArticle
          contentHtml
        }
      }
    }
  }
  ${JOURNAL_ARTICLE_FRAGMENT}
` as const;

const JOURNAL_PRODUCTS_QUERY = `#graphql
  query JournalProducts($query: String!, $first: Int!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        ...ProductCardItem
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

export function getUrls(request: Request) {
  const url = new URL(request.url);
  const prefix = getLocaleFromRequest(request).pathPrefix;
  return {
    abs: (path: string) => `${url.origin}${prefix}${path === '/' ? '' : path}`,
    canonical: url.origin + url.pathname,
    prefix,
  };
}

export async function getBlogList(storefront: Storefront): Promise<BlogListItem[]> {
  const {blogs} = await storefront.query(BLOG_LIST_QUERY, {cache: storefront.CacheLong()});
  return blogs.nodes.map((blog) => ({
    handle: blog.handle,
    parentHandle: blog.parentBlog?.value ?? undefined,
    title: blog.title,
  }));
}

export async function getBlog(
  storefront: Storefront,
  handle: string,
  limit = 50,
): Promise<Blog | undefined> {
  const {blog} = await storefront.query(BLOG_QUERY, {
    variables: {handle, first: limit},
    cache: storefront.CacheLong(),
  });
  if (!blog) return undefined;
  return {
    articles: blog.articles.nodes.map((node) => transformArticle(node as unknown as RawArticle, blog)),
    handle: blog.handle,
    seo: {description: blog.seo?.description ?? '', title: blog.seo?.title ?? blog.title},
    title: blog.title,
  };
}

export async function getAllArticles(storefront: Storefront): Promise<BlogArticle[]> {
  const blogs = await getBlogList(storefront);
  const loaded = await Promise.all(blogs.map((b) => getBlog(storefront, b.handle)));
  return loaded
    .flatMap((blog) => blog?.articles ?? [])
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function getArticleByHandle(
  storefront: Storefront,
  articleHandle: string,
): Promise<BlogArticle | undefined> {
  const {blogs} = await storefront.query(ARTICLE_BY_HANDLE_QUERY, {
    variables: {articleHandle},
    cache: storefront.CacheLong(),
  });
  for (const blog of blogs.nodes) {
    if (blog.articleByHandle) {
      return transformArticle(blog.articleByHandle as unknown as RawArticle, blog);
    }
  }
  return undefined;
}

// Cards for [products: ...] shortcodes, keyed by handle.
export async function getProductsByHandles(
  storefront: Storefront,
  handles: string[],
): Promise<Record<string, ProductCardData>> {
  const safe = handles.filter((handle) => /^[a-z0-9-]+$/.test(handle));
  if (safe.length === 0) return {};
  const {products} = await storefront.query(JOURNAL_PRODUCTS_QUERY, {
    variables: {first: safe.length, query: safe.map((handle) => `handle:${handle}`).join(' OR ')},
    cache: storefront.CacheLong(),
  });
  const byHandle: Record<string, ProductCardData> = {};
  for (const node of products.nodes) byHandle[node.handle] = toProductCardData(node);
  return byHandle;
}
