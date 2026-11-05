// Path: app/lib/collection-extras.server.ts
// Deferred data shared by the hub and standard collection pages: deals, reviews, after-item page.
// Every query is CacheLong. Callers add .catch() so a failure hides the section, not the page.
import type {Storefront} from '@shopify/hydrogen';
import type {YotpoCollectionReviewProduct, YotpoCollectionReviews} from '~/@yotpo';
import type {YotpoClient} from '~/@yotpo/client.server';
import type {ProductCardData} from '~/components/product-card/types';
import {transformArticle, type BlogArticle} from '~/lib/blog';
import type {AfterItemPage} from '~/lib/collection-hub';
import {PRODUCT_CARD_FRAGMENT, toProductCardData} from '~/lib/product-card';
import {withRatings} from '~/lib/ratings.server';

type Ctx = {storefront: Storefront; yotpo: YotpoClient};
type CardNode = Parameters<typeof toProductCardData>[0];

const DEALS_LIMIT = 8;
const SCAN_PAGES = 2; // 2 x 250 = the same 500-product fallback scan as Next.js
const REVIEW_PRODUCTS_LIMIT = 24;

const PICKED_DEALS_QUERY = `#graphql
  query CollectionPickedDeals($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      deals: metafield(namespace: "custom", key: "deals") {
        references(first: 8) {
          nodes {
            ... on Product {
              ...ProductCardItem
            }
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const DEALS_SCAN_QUERY = `#graphql
  query CollectionDealsScan(
    $handle: String!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 250, after: $after) {
        nodes {
          ...ProductCardItem
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const REVIEW_CANDIDATES_QUERY = `#graphql
  query CollectionReviewCandidates($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 250) {
        nodes {
          id
          handle
          title
        }
      }
    }
  }
` as const;

const AFTER_ITEM_QUERY = `#graphql
  query CollectionAfterItem($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      afterItem: metafield(namespace: "custom", key: "after_item_lists") {
        reference {
          ... on Page {
            id
            title
            body
          }
        }
      }
    }
  }
` as const;

function saving(card: ProductCardData): number {
  const now = Number.parseFloat(card.price.amount);
  const was = card.compareAtPrice ? Number.parseFloat(card.compareAtPrice.amount) : 0;
  return Number.isFinite(now) && Number.isFinite(was) ? was - now : 0;
}

function scanPage(storefront: Storefront, handle: string, after?: string) {
  return storefront.query(DEALS_SCAN_QUERY, {
    variables: {handle, after},
    cache: storefront.CacheLong(),
  });
}

// Picked deals (custom.deals) win. Otherwise the 8 biggest savings in the collection.
export async function loadCollectionDeals({storefront, yotpo}: Ctx, handle: string) {
  const {collection} = await storefront.query(PICKED_DEALS_QUERY, {
    variables: {handle},
    cache: storefront.CacheLong(),
  });
  const picked = (collection?.deals?.references?.nodes ?? []).flatMap((node) =>
    'handle' in node ? [node] : [],
  );
  if (picked.length > 0) return withRatings(yotpo, picked);

  const nodes: CardNode[] = [];
  let after: string | undefined;
  for (let page = 0; page < SCAN_PAGES; page += 1) {
    const {collection: scanned} = await scanPage(storefront, handle, after);
    const products = scanned?.products;
    if (!products) break;
    nodes.push(...products.nodes);
    if (!products.pageInfo.hasNextPage || !products.pageInfo.endCursor) break;
    after = products.pageInfo.endCursor;
  }

  const top = nodes
    .map((node) => ({node, saving: saving(toProductCardData(node, {}))}))
    .filter((entry) => entry.saving > 0)
    .sort((a, b) => b.saving - a.saving)
    .slice(0, DEALS_LIMIT)
    .map((entry) => entry.node);
  return top.length > 0 ? withRatings(yotpo, top) : [];
}

// Yotpo answers one product at a time, so reviews come from the collection's reviewed products.
export async function loadCollectionReviews(
  {storefront, yotpo}: Ctx,
  handle: string,
): Promise<YotpoCollectionReviews | null> {
  const {collection} = await storefront.query(REVIEW_CANDIDATES_QUERY, {
    variables: {handle},
    cache: storefront.CacheLong(),
  });
  const candidates = (collection?.products.nodes ?? []).flatMap((product) => {
    const id = product.id.split('/').pop();
    return id ? [{id, handle: product.handle, title: product.title}] : [];
  });
  if (candidates.length === 0) return null;

  const ratings = await yotpo.getProductCardRatings(candidates.map((candidate) => candidate.id));
  const reviewed: YotpoCollectionReviewProduct[] = candidates
    .filter((candidate) => (ratings.get(candidate.id)?.count ?? 0) > 0)
    .slice(0, REVIEW_PRODUCTS_LIMIT);
  if (reviewed.length === 0) return null;
  return yotpo.getCollectionReviews(reviewed);
}

export async function loadAfterItemPage(
  storefront: Storefront,
  handle: string,
): Promise<AfterItemPage | null> {
  const {collection} = await storefront.query(AFTER_ITEM_QUERY, {
    variables: {handle},
    cache: storefront.CacheLong(),
  });
  const reference = collection?.afterItem?.reference;
  return reference && 'body' in reference
    ? {id: reference.id, title: reference.title, body: reference.body}
    : null;
}

const COLLECTION_ARTICLES_QUERY = `#graphql
  query CollectionArticles($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      posts: metafield(namespace: "custom", key: "posts") {
        references(first: 50) {
          nodes {
            ... on Article {
              handle
              title
              publishedAt
              excerpt
              image {
                url
                altText
                width
                height
              }
              blog {
                handle
                title
              }
            }
          }
        }
      }
    }
  }
` as const;

// Articles for the Expert Advice tab. Empty when nothing is linked, which hides the tabs.
export async function loadCollectionArticles(
  storefront: Storefront,
  handle: string,
): Promise<BlogArticle[]> {
  const {collection} = await storefront.query(COLLECTION_ARTICLES_QUERY, {
    variables: {handle},
    cache: storefront.CacheLong(),
  });
  return (collection?.posts?.references?.nodes ?? []).flatMap((node) =>
    'blog' in node ? [transformArticle(node, node.blog)] : [],
  );
}
