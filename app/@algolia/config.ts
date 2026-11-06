// Reads Algolia settings from the Oxygen env. Nothing throws when a variable is missing:
// the client returns null and callers fall back to Shopify search.
// - App ID, search key and index name are public (search-only key). No admin key is read here.
// - Off by default: set ALGOLIA_ENABLED="true" per environment once the index is checked.
// - NEXT_PUBLIC_* names are accepted as fallbacks so env files copy over from the Next repo.
// - Sorted views are replicas named `${indexName}_price_asc`, `_price_desc`, `_newest`.

export type AlgoliaConfig = {
  appId: string | null;
  searchKey: string | null;
  indexName: string;
  enabled: boolean;
  replicas: {
    bestSelling: string;
    priceAsc: string;
    priceDesc: string;
    newest: string;
  };
  hitsPerPage: number;
  facets: readonly string[];
  recommend: {maxRecommendations: number; threshold: number};
  revalidateSeconds: number;
};

export type PublicAlgoliaConfig = {
  appId: string;
  searchKey: string;
  indexName: string;
};

function read(env: object, ...keys: string[]): string | undefined {
  const bag = env as Record<string, unknown>;
  for (const key of keys) {
    const value = bag[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim().replace(/^["']|["']$/g, '');
    }
  }
  return undefined;
}

export function createAlgoliaConfig(env: object): AlgoliaConfig {
  const indexName =
    read(env, 'ALGOLIA_INDEX_NAME', 'NEXT_PUBLIC_ALGOLIA_INDEX_NAME') ??
    'shopify_products';
  return {
    appId: read(env, 'ALGOLIA_APP_ID', 'NEXT_PUBLIC_ALGOLIA_APP_ID') ?? null,
    searchKey:
      read(env, 'ALGOLIA_SEARCH_KEY', 'NEXT_PUBLIC_ALGOLIA_SEARCH_KEY') ?? null,
    indexName,
    enabled:
      read(env, 'ALGOLIA_ENABLED', 'NEXT_PUBLIC_ALGOLIA_ENABLED') === 'true',
    replicas: {
      bestSelling: indexName,
      priceAsc: `${indexName}_price_asc`,
      priceDesc: `${indexName}_price_desc`,
      newest: `${indexName}_newest`,
    },
    hitsPerPage: 24,
    facets: ['colors', 'sizes', 'productType', 'vendor', 'inStock', 'onSale'],
    recommend: {maxRecommendations: 8, threshold: 0},
    revalidateSeconds: 300,
  };
}

export function isAlgoliaReady(
  config: AlgoliaConfig,
): config is AlgoliaConfig & {appId: string; searchKey: string} {
  return Boolean(config.enabled && config.appId && config.searchKey);
}

/** What the browser may see (for Insights events). Null when Algolia is off. */
export function toPublicAlgoliaConfig(
  config: AlgoliaConfig,
): PublicAlgoliaConfig | null {
  return isAlgoliaReady(config)
    ? {
        appId: config.appId,
        searchKey: config.searchKey,
        indexName: config.indexName,
      }
    : null;
}