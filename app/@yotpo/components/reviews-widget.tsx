// Path: app/@yotpo/components/reviews-widget.tsx
// Presentational: the route loader fetches the reviews and passes them in.
// Renders nothing when data is null (Yotpo unavailable).
// The #reviews anchor should live on a wrapper in the product page.

import type {YotpoProductReviews} from '../types';
import {WriteReviewButton} from './review-form';
import {ReviewsBrowser} from './reviews-browser';

export function ProductReviews({
  data,
  handle,
  productTitle,
  pageSize = 5,
}: {
  data: YotpoProductReviews | null;
  handle: string;
  productTitle: string;
  pageSize?: number;
}) {
  if (!data) return null;

  const {reviews, bottomline} = data;

  if (bottomline.total_review === 0) {
    return (
      <section className="w-full px-6 py-12 text-center font-sans">
        <h2 className="mb-4 text-lg font-bold text-black">Customer Reviews</h2>
        <p className="mb-5 text-sm text-neutral-500">
          No reviews yet. Be the first to share your thoughts.
        </p>
        <WriteReviewButton handle={handle} productTitle={productTitle} />
      </section>
    );
  }

  return (
    <section className="w-full font-sans">
      <h2 className="mb-6 text-lg font-bold text-black">Customer Reviews</h2>
      <ReviewsBrowser
        reviews={reviews}
        bottomline={bottomline}
        handle={handle}
        productTitle={productTitle}
        pageSize={pageSize}
      />
    </section>
  );
}
