// Path: app/@yotpo/index.ts
// Browser-safe surface. Do NOT re-export client.server.ts here; import it
// only from loaders, actions and app/lib/context.ts.

export {StarRating} from './components/star-ratings';
export {ProductReviews} from './components/reviews-widget';
export {CollectionReviews} from './components/collection-reviews';

export type {
  YotpoReview,
  YotpoBottomline,
  YotpoProductReviews,
  YotpoRatingSummary,
  YotpoCollectionReview,
  YotpoCollectionReviewProduct,
  YotpoCollectionReviews,
} from './types';
