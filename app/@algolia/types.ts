/** One record in the Algolia index. objectID is the numeric Shopify product ID. */
export type AlgoliaProductRecord = {
  objectID: string;
  handle: string;
  title: string;
  vendor?: string;
  productType?: string;
  collections: string[];
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  onSale: boolean;
  colors?: string[];
  sizes?: string[];
  bestSellerRank?: number;
  createdAtTimestamp?: number;
};

export type AlgoliaSort = 'best-selling' | 'price-asc' | 'price-desc' | 'newest';

export type AlgoliaFilters = {
  collection?: string;
  colors?: string[];
  sizes?: string[];
  productType?: string[];
  vendor?: string[];
  inStockOnly?: boolean;
  onSale?: boolean;
  priceMin?: number;
  priceMax?: number;
};

export type AlgoliaSearchInput = {
  query?: string;
  filters?: AlgoliaFilters;
  sort?: AlgoliaSort;
  /** 0-based */
  page?: number;
  hitsPerPage?: number;
};

export type AlgoliaSearchResult = {
  /** Product IDs in ranked order. Hydrate prices/stock from Shopify with these. */
  ids: string[];
  handles: string[];
  facets: Record<string, Record<string, number>>;
  total: number;
  page: number;
  pages: number;
  queryID?: string;
};

export type AlgoliaRecommendModel =
  | 'related-products'
  | 'bought-together'
  | 'trending-items'
  | 'looking-similar';

export type AlgoliaRecommendInput = {
  model: AlgoliaRecommendModel;
  /** Required for every model except trending-items. */
  objectID?: string;
  maxRecommendations?: number;
  /** Restrict trending to a collection handle. */
  collection?: string;
};

export type AlgoliaInsightsEvent = {
  eventType: 'click' | 'conversion' | 'view';
  eventName: string;
  objectIDs: string[];
  queryID?: string;
  positions?: number[];
};