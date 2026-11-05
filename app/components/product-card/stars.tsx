import {cn} from 'cn';

import {Star} from '../../@yotpo/components/star';

const STAR_COUNT = 5;

const COPY = {
  writeReview: 'Write a review',
  ariaLabel: (score: number, count: number) =>
    `Rating of ${score.toFixed(1)} out of 5 stars, ${count} reviews`,
};

// Filled stars use the foreground color because the brand yellow (#FFE000) is only
// 1.32:1 against white. To use the brand yellow instead, delete the `color` prop
// below (Star then defaults to yotpoConfig.brand.starsColor).
function StarRow({className}: {className?: string}) {
  return (
    <span className={cn('flex w-max', className)}>
      {Array.from({length: STAR_COUNT}, (_, i) => (
        <Star key={i} filled className="size-3 shrink-0" color="currentColor" />
      ))}
    </span>
  );
}

/** Card rating line: partial-fill stars, "4.4/5", and the review count. Zero reviews shows a prompt. */
export function CardStars({score, count}: {score: number; count: number}) {
  if (!count) {
    return (
      <span className="text-ds-small font-medium text-foreground underline underline-offset-2 group-hover/card:text-primary">
        {COPY.writeReview}
      </span>
    );
  }
  const percent = Math.max(0, Math.min(100, (score / STAR_COUNT) * 100));
  return (
    <div
      role="img"
      aria-label={COPY.ariaLabel(score, count)}
      className="flex items-center gap-1 text-ds-small"
    >
      <span className="relative inline-flex text-foreground/20">
        <StarRow />
        <span
          className="absolute inset-y-0 left-0 overflow-hidden text-foreground"
          style={{width: `${percent}%`}}
        >
          <StarRow />
        </span>
      </span>
      <span className="font-semibold">{score.toFixed(1)}/5</span>
      <span className="text-muted-foreground">({count.toLocaleString('en-US')})</span>
    </div>
  );
}
