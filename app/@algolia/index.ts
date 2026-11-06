// Client-safe public surface. Server code imports `client.server.ts` directly.
export {createAlgoliaConfig, isAlgoliaReady, toPublicAlgoliaConfig} from './config';
export type {AlgoliaConfig, PublicAlgoliaConfig} from './config';
export {sendAlgoliaEvent} from './events';
export {productGid, productGids, productObjectId} from './ids';
export {TrackProductView} from './components/track-product-view';
export {TrackSearchClicks} from './components/track-search-clicks';
export type {
  AlgoliaProductRecord,
  AlgoliaFilters,
  AlgoliaSort,
  AlgoliaSearchInput,
  AlgoliaSearchResult,
  AlgoliaRecommendModel,
  AlgoliaRecommendInput,
  AlgoliaInsightsEvent,
} from './types';