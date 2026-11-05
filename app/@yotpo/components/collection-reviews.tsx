// Path: app/@yotpo/components/collection-reviews.tsx
// Presentational: the route loader gathers the merged reviews and passes them in.
// Renders nothing when data is null (Yotpo unavailable or no reviews).

import type {YotpoCollectionReviews} from '../types';
import {ReviewsBrowser} from './reviews-browser';

export function CollectionReviews({
  collectionTitle,
  data,
  pageSize = 5,
}: {
  collectionTitle: string;
  data: YotpoCollectionReviews | null;
  pageSize?: number;
}) {
  if (!data) return null;

  return (
    <section aria-label="Customer reviews" className="font-sans">
      <h2 className="mb-5 text-xl font-semibold sm:text-2xl">
        Customer reviews for {collectionTitle}
      </h2>
      <ReviewsBrowser
        reviews={data.reviews}
        bottomline={data.bottomline}
        pageSize={pageSize}
      />
    </section>
  );
}
