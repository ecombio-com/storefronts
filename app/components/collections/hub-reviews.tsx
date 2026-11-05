// Path: app/components/collections/hub-reviews.tsx
// Reel-style review cards on hub pages: reviews with text, photo reviews first, at most 8.
import {Suspense} from 'react';
import {Await} from 'react-router';
import type {YotpoCollectionReviews} from '~/@yotpo';
import {DealsCarousel} from './deals-carousel';

const COPY = {title: 'What customers are saying'};
const MAX_REELS = 8;

type Review = YotpoCollectionReviews['reviews'][number];

function photo(review: Review) {
  return review.images_data?.[0]?.original_url ?? review.images_data?.[0]?.thumb_url;
}

function Reels({data}: {data: YotpoCollectionReviews | null}) {
  if (!data) return null;
  const withText = data.reviews.filter((review) => review.content?.trim());
  const picked = [
    ...withText.filter((review) => photo(review)),
    ...withText.filter((review) => !photo(review)),
  ].slice(0, MAX_REELS);
  if (picked.length === 0) return null;

  return (
    <DealsCarousel title={COPY.title}>
      {picked.map((review) => {
        const src = photo(review);
        return (
          <article
            key={review.id}
            className="flex w-80 shrink-0 snap-start flex-col overflow-hidden rounded-ds-lg bg-card shadow-ds-drop-xs ring-1 ring-border-subtle"
          >
            <div className="relative aspect-9/14 bg-foreground">
              {src ? (
                <img
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  decoding="async"
                  loading="lazy"
                  src={src}
                />
              ) : null}
              <span className="absolute top-3 left-3 rounded-ds-sm bg-overlay-light/90 px-2 py-0.5 text-ds-small font-medium text-overlay-dark">
                {review.user.display_name}
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-foreground via-foreground/90 to-transparent p-4 pt-40 text-overlay-light">
                <p className="line-clamp-4 text-ds-regular leading-6">{review.content}</p>
                <p className="mt-3 text-ds-regular font-medium">
                  <span aria-hidden="true">{'\u2605'.repeat(review.score)}</span> {review.score}/5
                </p>
              </div>
            </div>
            <p className="line-clamp-2 p-4 text-ds-regular">{review.product.title}</p>
          </article>
        );
      })}
    </DealsCarousel>
  );
}

export function HubReviews({reviews}: {reviews: Promise<YotpoCollectionReviews | null>}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={reviews} errorElement={null}>
        {(data) => <Reels data={data} />}
      </Await>
    </Suspense>
  );
}
