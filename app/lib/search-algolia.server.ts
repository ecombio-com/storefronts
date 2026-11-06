import type {Storefront} from '@shopify/hydrogen';
import {type AlgoliaDeps, searchProducts} from '~/@algolia/client.server';
import {isAlgoliaReady} from '~/@algolia/config';
import {productGids} from '~/@algolia/ids';
import type {AlgoliaSort} from '~/@algolia/types';
import type {ProductCardData} from '~/components/product-card/types';
import {parseSortBy} from '~/lib/collection-browse';
import {PRODUCT_CARD_FRAGMENT, toProductCardData} from '~/lib/product-card';

// Algolia-backed text search for /search. Algolia decides which products and in what order;
// Shopify supplies the live product data. Every failure path returns null so the caller falls
// back to the Shopify search.

export const ALGOLIA_CURSOR_PREFIX = 'algolia:';

export function parseAlgoliaCursor(cursor: string): number | null {
  if (!cursor.startsWith(ALGOLIA_CURSOR_PREFIX)) return null;
  const page = Number(cursor.slice(ALGOLIA_CURSOR_PREFIX.length));
  return Number.isInteger(page) && page >= 0 ? page : null;
}

// Search offers relevance (the default, 'manual' here) and price; any other sort uses Shopify.
// 'best-selling' is the primary index: relevance first, then in-stock, then best sellers.
export function toAlgoliaSort(sortBy?: string | null): AlgoliaSort | null {
  const {sortKey, reverse} = parseSortBy(sortBy);
  if (sortKey === 'COLLECTION_DEFAULT') return 'best-selling';
  if (sortKey === 'PRICE') return reverse ? 'price-desc' : 'price-asc';
  return null;
}

const ALGOLIA_PRODUCTS_BY_IDS_QUERY = `#graphql
  query AlgoliaProductsByIds(
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      __typename
      ... on Product {
        ...ProductCardItem
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

/** Loads live Shopify cards for Algolia's ranked IDs. nodes() keeps input order and drops unpublished products. */
export async function hydrateProducts(
  storefront: Storefront,
  objectIDs: string[],
): Promise<ProductCardData[]> {
  if (objectIDs.length === 0) return [];
  const {nodes} = await storefront.query(ALGOLIA_PRODUCTS_BY_IDS_QUERY, {
    cache: storefront.CacheShort(),
    variables: {ids: productGids(objectIDs)},
  });
  return nodes.flatMap((node) =>
    node?.__typename === 'Product' ? [toProductCardData(node)] : [],
  );
}

export async function searchViaAlgolia(
  deps: AlgoliaDeps,
  storefront: Storefront,
  {
    collection,
    hitsPerPage,
    page = 0,
    query,
    sortBy,
  }: {
    collection?: string;
    hitsPerPage: number;
    page?: number;
    query?: string;
    sortBy?: string | null;
  },
) {
  const sort = toAlgoliaSort(sortBy);
  if (!isAlgoliaReady(deps.config) || !query?.trim() || !sort) return null;
  try {
    const result = await searchProducts(deps, {
      query: query.trim(),
      filters: collection ? {collection} : undefined,
      sort,
      page,
      hitsPerPage,
    });
    if (!result || result.total === 0) return null;

    const products = await hydrateProducts(storefront, result.ids);
    if (products.length === 0) return null;

    const hasNextPage = result.page + 1 < result.pages;
    return {
      products,
      queryID: result.queryID,
      total: result.total,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: result.page > 0,
        startCursor: null as string | null,
        endCursor: hasNextPage
          ? `${ALGOLIA_CURSOR_PREFIX}${result.page + 1}`
          : null,
      },
    };
  } catch {
    return null;
  }
}