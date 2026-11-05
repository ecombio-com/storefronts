// Path: app/@yotpo/components/star-ratings.tsx
// Presentational: the route loader fetches the summary and passes it in.
// Renders nothing when the summary is null (Yotpo unavailable).
// The whole badge links to the reviews section (default #reviews).

import type {YotpoRatingSummary} from '../types';
import {StarRow} from './star';

export function StarRating({
  summary,
  href = '#reviews',
}: {
  summary: YotpoRatingSummary | null;
  href?: string;
}) {
  if (!summary) return null;

  const {averageScore, totalReviews} = summary;

  if (totalReviews === 0) {
    return (
      <a
        href={href}
        className="inline-flex items-center font-sans text-sm font-bold text-black underline-offset-2 transition-opacity hover:opacity-70"
      >
        Write a review
      </a>
    );
  }

  const label = `${Number(averageScore.toFixed(1))} out of 5 stars, ${totalReviews} ${
    totalReviews === 1 ? 'review' : 'reviews'
  }. Jump to reviews`;

  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex items-center gap-2.5 font-sans hover:opacity-80"
    >
      <StarRow score={averageScore} label="" starClassName="h-5 w-5" color="#000" />
      <span className="text-base font-bold text-black">{averageScore.toFixed(1)}</span>
      <span className="h-4 w-px bg-neutral-400" />
      <span className="text-base font-bold text-black underline-offset-2 transition-opacity hover:opacity-70">
        {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
      </span>
    </a>
  );
}
