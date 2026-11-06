import {CacheCustom, createWithCache} from '@shopify/hydrogen';
import {type AlgoliaConfig, createAlgoliaConfig, isAlgoliaReady} from './config';
import type {
  AlgoliaFilters,
  AlgoliaRecommendInput,
  AlgoliaSearchInput,
  AlgoliaSearchResult,
  AlgoliaSort,
} from './types';

// Server-only, dependency-free client (plain fetch against Algolia's REST API), cached through
// the Oxygen cache (replaces Next's `revalidate: 300`). Every function returns null when Algolia
// is off or errors, so callers fall back to Shopify. Algolia returns IDs; prices and stock stay Shopify's.

// A slow Algolia must never hold up the page: give up quickly and let the caller fall back.
const REQUEST_TIMEOUT_MS = 2500;

export type AlgoliaDeps = {
  config: AlgoliaConfig;
  withCache: ReturnType<typeof createWithCache>;
};

export function createAlgoliaDeps({
  env,
  ...cacheArgs
}: {env: object} & Parameters<typeof createWithCache>[0]): AlgoliaDeps {
  return {
    config: createAlgoliaConfig(env),
    withCache: createWithCache(cacheArgs),
  };
}

function warn(message: string, detail?: unknown): void {
  console.warn(`[algolia] ${message}`, detail ?? '');
}

async function post<T>(
  deps: AlgoliaDeps,
  path: string,
  body: unknown,
  label: string,
): Promise<T | null> {
  const {config, withCache} = deps;
  if (!isAlgoliaReady(config)) return null;

  const payload = JSON.stringify(body);
  try {
    const {data, response} = await withCache.fetch<T>(
      `https://${config.appId}-dsn.algolia.net${path}`,
      {
        method: 'POST',
        headers: {
          'X-Algolia-Application-Id': config.appId,
          'X-Algolia-API-Key': config.searchKey,
          'Content-Type': 'application/json',
        },
        body: payload,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
      {
        cacheKey: ['algolia', label, config.indexName, payload],
        cacheStrategy: CacheCustom({
          mode: 'public',
          maxAge: config.revalidateSeconds,
          staleWhileRevalidate: 60,
        }),
        shouldCacheResponse: (_body: T, res: Response) => res.ok,
      },
    );
    if (!response.ok) {
      warn(`${label} failed with HTTP ${response.status}`);
      return null;
    }
    return data;
  } catch (error) {
    warn(`${label} request threw`, error);
    return null;
  }
}

const q = (v: string) => `"${v.replace(/"/g, '\\"')}"`;

export function buildFilterString(f: AlgoliaFilters = {}): string {
  const parts: string[] = [];
  if (f.collection) parts.push(`collections:${q(f.collection)}`);
  const orGroup = (attr: string, values?: string[]) => {
    if (values?.length) {
      parts.push(`(${values.map((v) => `${attr}:${q(v)}`).join(' OR ')})`);
    }
  };
  orGroup('colors', f.colors);
  orGroup('sizes', f.sizes);
  orGroup('productType', f.productType);
  orGroup('vendor', f.vendor);
  if (f.inStockOnly) parts.push('inStock:true');
  if (f.onSale) parts.push('onSale:true');
  if (f.priceMin !== undefined) parts.push(`price >= ${f.priceMin}`);
  if (f.priceMax !== undefined) parts.push(`price <= ${f.priceMax}`);
  return parts.join(' AND ');
}

export function indexForSort(
  config: AlgoliaConfig,
  sort: AlgoliaSort = 'best-selling',
): string {
  const r = config.replicas;
  return {
    'best-selling': r.bestSelling,
    'price-asc': r.priceAsc,
    'price-desc': r.priceDesc,
    newest: r.newest,
  }[sort];
}

type RawSearch = {
  hits?: {objectID: string; handle: string}[];
  facets?: Record<string, Record<string, number>>;
  nbHits?: number;
  page?: number;
  nbPages?: number;
  queryID?: string;
};

export async function searchProducts(
  deps: AlgoliaDeps,
  input: AlgoliaSearchInput,
): Promise<AlgoliaSearchResult | null> {
  const {config} = deps;
  const data = await post<RawSearch>(
    deps,
    `/1/indexes/${encodeURIComponent(indexForSort(config, input.sort))}/query`,
    {
      query: input.query ?? '',
      filters: buildFilterString(input.filters),
      facets: config.facets,
      page: input.page ?? 0,
      hitsPerPage: input.hitsPerPage ?? config.hitsPerPage,
      attributesToRetrieve: ['objectID', 'handle'],
      attributesToHighlight: [],
      clickAnalytics: true,
    },
    'search',
  );
  if (!data) return null;
  const hits = data.hits ?? [];
  return {
    ids: hits.map((h) => h.objectID),
    handles: hits.map((h) => h.handle),
    facets: data.facets ?? {},
    total: data.nbHits ?? 0,
    page: data.page ?? 0,
    pages: data.nbPages ?? 0,
    queryID: data.queryID,
  };
}

/** Collection page = same engine, filtered by collection handle. */
export function getCollectionProducts(
  deps: AlgoliaDeps,
  collection: string,
  input: Omit<AlgoliaSearchInput, 'filters'> & {
    filters?: Omit<AlgoliaFilters, 'collection'>;
  } = {},
) {
  return searchProducts(deps, {
    ...input,
    filters: {...input.filters, collection},
  });
}

/** Returns recommended product IDs (ranked). Needs Recommend models trained on events. */
export async function getRecommendedProductIds(
  deps: AlgoliaDeps,
  input: AlgoliaRecommendInput,
): Promise<string[] | null> {
  const {config} = deps;
  const request: Record<string, unknown> = {
    indexName: config.indexName,
    model: input.model,
    threshold: config.recommend.threshold,
    maxRecommendations:
      input.maxRecommendations ?? config.recommend.maxRecommendations,
    queryParameters: {filters: 'inStock:true', attributesToRetrieve: ['objectID']},
  };
  if (input.model === 'trending-items') {
    if (input.collection) {
      request.facetName = 'collections';
      request.facetValue = input.collection;
    }
  } else {
    if (!input.objectID) return null;
    request.objectID = input.objectID;
  }
  const data = await post<{results?: {hits?: {objectID: string}[]}[]}>(
    deps,
    '/1/indexes/*/recommendations',
    {requests: [request]},
    'recommendations',
  );
  const hits = data?.results?.[0]?.hits ?? [];
  return hits.length ? hits.map((h) => h.objectID) : null;
}