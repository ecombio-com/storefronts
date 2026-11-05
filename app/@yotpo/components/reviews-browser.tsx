// Path: @yotpo/components/reviews-browser.tsx
//
// Shared interactive reviews section for product AND collection pages (based on the collection design).
// Rating summary with clickable bars, filters (customer pictures toggle, reset), a top photo strip,
// sort, and the review list with "Show more".
//
// - Collection pages: reviews carry `product`, so each card links to its product.
// - Product pages: pass `handle` + `productTitle` to show the "Write a review" button in the
//   rating card; reviews have no `product`, so the product link footer is skipped.
//
// Filtering and sorting run in the browser over the reviews gathered by the server component.
// Photos use unoptimized next/image so Yotpo's image host needs no entry in next.config.

import { BadgeCheckIcon, SearchIcon, ThumbsUpIcon, Trash2Icon, XIcon } from "lucide-react";
import Image from "./remote-image";
import Link from "~/components/ui/localized-link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "~/components/ui/icons";

import type { YotpoBottomline, YotpoCollectionReview, YotpoReview } from "../types";
import { WriteReviewButton } from "./review-form";
import { Star, StarRow } from "./star";
import { UgcMediaViewer } from "./ugc-media";

// Product-page reviews have no `product`; collection-page reviews do.
type BrowserReview = YotpoReview & { product?: YotpoCollectionReview["product"] };

type SortKey = "recent" | "highest" | "lowest" | "helpful";
type Photo = { full: string; thumb: string };

const SORT_LABELS: Record<SortKey, string> = {
  recent: "Most recent",
  highest: "Highest rating",
  lowest: "Lowest rating",
  helpful: "Most helpful",
};

const TOP_PHOTO_REVIEWS = 12;

const controlClass =
  "rounded-full border border-neutral-400 bg-white px-3 py-1.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black";

const time = (r: BrowserReview) => Date.parse(r.created_at) || 0;

function photosOf(review: BrowserReview): Photo[] {
  return (review.images_data ?? []).flatMap((image) => {
    const full = image.original_url ?? image.thumb_url;
    const thumb = image.thumb_url ?? image.original_url;
    return full && thumb ? [{ full, thumb }] : [];
  });
}

function reviewerName(review: BrowserReview): string {
  return review.user?.display_name?.trim() || "Anonymous";
}

// UTC keeps server and browser output identical (no hydration mismatch near midnight).
function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Slide-in side panel. Always rendered so it can animate; "invisible" keeps it out of the tab order when closed.
function HowReviewsWork({
  open,
  onClose,
  showProductNote,
}: {
  open: boolean;
  onClose: () => void;
  showProductNote: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={"fixed inset-0 z-50 " + (open ? "" : "pointer-events-none invisible")}>
      <div
        onClick={onClose}
        className={
          "absolute inset-0 bg-black/50 transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-reviews-work-title"
        aria-hidden={!open}
        className={
          "absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl transition-transform duration-300 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex items-center justify-between gap-4">
          <h3 id="how-reviews-work-title" className="text-sm font-semibold text-black">
            How reviews work
          </h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-black hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 text-sm leading-relaxed text-black">
          <p>
            Customers rate their purchase from 1 to 5 stars and can add a title, a written review
            and photos. The overall rating is the average of all of those star ratings.
          </p>
          <p>
            Reviews are collected through Yotpo after an order. Use the star bars, the photo switch
            and the sort menu to find the reviews that matter most to you.
          </p>
          {showProductNote ? (
            <p>
              Each review shows the product it was written for, with a link to that product page.
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function TopPhotoReviews({
  reviews,
  onOpen,
}: {
  reviews: BrowserReview[];
  onOpen: (reviewId: number) => void;
}) {
  const titleId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function update() {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }

  // Check once on mount and when the reviews change, so "next" is disabled if every tile already fits.
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews]);

  if (reviews.length === 0) return null;

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
  }

  const arrowClass = (disabled: boolean) =>
    "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors " +
    (disabled
      ? "cursor-not-allowed bg-muted text-muted-foreground/50"
      : "bg-primary text-primary-foreground hover:opacity-80");

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 id={titleId} className="text-lg font-semibold text-black">
          Top reviews with photos
        </h3>
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            aria-label="Previous photos"
            disabled={atStart}
            onClick={() => scrollByPage(-1)}
            className={arrowClass(atStart)}
          >
            <ChevronLeftIcon aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Next photos"
            disabled={atEnd}
            onClick={() => scrollByPage(1)}
            className={arrowClass(atEnd)}
          >
            <ChevronRightIcon aria-hidden="true" className="size-6" />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        onScroll={update}
        role="region"
        aria-labelledby={titleId}
        tabIndex={0}
        className={
          "-m-3 snap-x snap-mandatory scroll-pl-3 overflow-x-auto overscroll-x-contain scroll-smooth rounded-sm focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
          (atEnd ? "" : "[mask-image:linear-gradient(to_right,#000_90%,transparent)]")
        }
      >
        <ul className="flex w-max gap-2 p-3 pb-5 md:gap-4">
          {reviews.map((review) => {
            const photo = photosOf(review)[0];
            if (!photo) return null;
            const name = reviewerName(review);
            return (
              <li key={review.id} className="w-40 shrink-0 snap-start list-none">
                <div className="relative size-40 overflow-hidden rounded-ds-lg bg-muted shadow-ds-drop-xs transition-shadow hover:shadow-ds-drop-md">
                  <Image
                    src={photo.thumb}
                    alt={"Photo from " + name + "'s review"}
                    fill
                    unoptimized
                    sizes="160px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent to-60%" />
                  <span className="absolute top-4 left-4 max-w-32 truncate rounded-ds-sm bg-white px-1 text-xs font-bold text-black">
                    {name}
                  </span>
                  <div className="absolute inset-x-4 bottom-4 flex items-center gap-1 text-white">
                    <StarRow
                      score={review.score}
                      label={"Rating of " + review.score + " out of 5 stars"}
                      starClassName="h-3 w-3"
                      color="#fff"
                    />
                    <span className="text-xs font-bold">{review.score}/5</span>
                  </div>
                  <button
                    type="button"
                    title={name}
                    aria-label={"Open photos from " + name + "'s review"}
                    onClick={() => onOpen(review.id)}
                    className="absolute inset-0 cursor-zoom-in rounded-ds-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onOpenPhoto,
}: {
  review: BrowserReview;
  onOpenPhoto: (photoIndex: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const date = shortDate(review.created_at);
  const name = reviewerName(review);
  const photos = photosOf(review);
  const long = review.content.length > 280;

  const helpful = (
    <span
      aria-label={review.votes_up + " found this helpful"}
      className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 px-2 py-1 text-xs text-black"
    >
      {review.votes_up}
      <ThumbsUpIcon className="size-3.5" />
    </span>
  );

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-black">
            <span className="truncate">{name}</span>
            {review.verified_buyer ? (
              <span className="inline-flex items-center gap-1 rounded bg-[#dbe4f7] px-1.5 py-0.5 text-xs font-medium text-black">
                <BadgeCheckIcon className="size-3.5" />
                Verified purchase
              </span>
            ) : null}
          </p>
          {date ? <p className="mt-1 text-xs text-neutral-700">Reviewed {date}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          <StarRow score={review.score} color="#000" />
          <span className="text-sm font-semibold text-black">{review.score}/5</span>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.full}
              type="button"
              onClick={() => onOpenPhoto(i)}
              aria-label={
                "Open photo " + (i + 1) + " of " + photos.length + " from " + name + "'s review"
              }
              className="relative block size-24 cursor-zoom-in overflow-hidden rounded-md bg-neutral-100 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
            >
              <Image
                src={photo.thumb}
                alt={"Photo from " + name + "'s review"}
                fill
                unoptimized
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {review.title ? (
        <p className="mt-4 text-sm font-semibold text-black">{review.title}</p>
      ) : null}
      <p
        className={
          "mt-2 text-[13px] leading-relaxed whitespace-pre-line text-black " +
          (long && !expanded ? "line-clamp-4" : "")
        }
      >
        {review.content}
      </p>
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-sm font-semibold text-black transition-opacity hover:opacity-70"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}

      {review.product ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-xs">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="truncate text-xs text-neutral-700">{review.product.title}</p>
            <Link
              href={"/products/" + review.product.handle}
              className="shrink-0 font-semibold text-black transition-opacity hover:opacity-70"
            >
              See item
            </Link>
          </div>
          {helpful}
        </div>
      ) : review.votes_up > 0 ? (
        <div className="mt-4 flex">{helpful}</div>
      ) : null}
    </article>
  );
}

// Two-handle range (1 to 5 stars). Both inputs overlap; only their thumbs take pointer events.
function RatingRange({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const at = (value: number) => ((value - 1) / 4) * 100;
  const stars = (n: number) => n + (n === 1 ? " star" : " stars");
  const input =
    "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent " +
    "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-card " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-card";

  return (
    <div className="mt-2">
      <div
        aria-hidden="true"
        className="mb-1 flex justify-between text-xs font-semibold text-black"
      >
        <span>1 star</span>
        <span>3 stars</span>
        <span>5 stars</span>
      </div>
      <div className="relative h-5">
        <div
          aria-hidden="true"
          className="absolute inset-x-2.5 top-1/2 h-0.5 -translate-y-1/2 bg-border"
        >
          <div
            className="absolute inset-y-0 bg-primary"
            style={{ left: at(min) + "%", width: at(max) - at(min) + "%" }}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground"
              style={{ left: i * 25 + "%" }}
            />
          ))}
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={min}
          aria-label="Minimum rating"
          aria-valuetext={stars(min)}
          onChange={(e) => onChange(Math.min(Number(e.target.value), max), max)}
          className={input + (min > 2 ? " z-20" : "")}
        />
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={max}
          aria-label="Maximum rating"
          aria-valuetext={stars(max)}
          onChange={(e) => onChange(min, Math.max(Number(e.target.value), min))}
          className={input + " z-10"}
        />
      </div>
    </div>
  );
}

export function ReviewsBrowser({
  reviews,
  bottomline,
  pageSize,
  handle,
  productTitle,
}: {
  reviews: BrowserReview[];
  bottomline: YotpoBottomline;
  pageSize: number;
  /** Product pages only: with `productTitle`, shows the "Write a review" button. */
  handle?: string;
  productTitle?: string;
}) {
  const [minRating, setMinRating] = useState(1); // 1 to 5 = all ratings
  const [maxRating, setMaxRating] = useState(5);
  const [withPhotos, setWithPhotos] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [shown, setShown] = useState(pageSize);
  const [infoOpen, setInfoOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtersActive = minRating !== 1 || maxRating !== 5 || withPhotos || query !== "";

  const photoReviews = useMemo(
    () =>
      reviews
        .filter((r) => photosOf(r).length > 0)
        .sort((a, b) => b.votes_up - a.votes_up || time(b) - time(a)),
    [reviews],
  );
  const topPhotoReviews = useMemo(() => photoReviews.slice(0, TOP_PHOTO_REVIEWS), [photoReviews]);
  const [viewing, setViewing] = useState<{ review: number; photo: number } | null>(null);

  function openViewer(reviewId: number, photo: number) {
    const index = photoReviews.findIndex((r) => r.id === reviewId);
    if (index >= 0) setViewing({ review: index, photo });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = reviews.filter((r) => {
      if (r.score < minRating || r.score > maxRating) return false;
      if (withPhotos && photosOf(r).length === 0) return false;
      if (q) {
        const haystack = [r.title, r.content, reviewerName(r), r.product?.title]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      switch (sort) {
        case "highest":
          return b.score - a.score || time(b) - time(a);
        case "lowest":
          return a.score - b.score || time(b) - time(a);
        case "helpful":
          return b.votes_up - a.votes_up || time(b) - time(a);
        default:
          return time(b) - time(a);
      }
    });
  }, [reviews, minRating, maxRating, withPhotos, sort, query]);

  function clearFilters() {
    setMinRating(1);
    setMaxRating(5);
    setWithPhotos(false);
    setQuery("");
    setShown(pageSize);
  }

  function onSearch(value: string) {
    setQuery(value);
    setShown(pageSize);
  }

  function toggleRating(star: number) {
    const only = minRating === star && maxRating === star;
    setMinRating(only ? 1 : star);
    setMaxRating(only ? 5 : star);
    setShown(pageSize);
  }

  function togglePhotos() {
    setWithPhotos((value) => !value);
    setShown(pageSize);
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      <aside className="grid content-start gap-8 lg:sticky lg:top-[calc(var(--header-offset,0px)_+_1rem)] lg:[transition:var(--header-offset-transition,none)]">
        {/* Rating card: the average is the anchor, bars below stay clickable as the rating filter. */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm font-semibold text-black">Overall rating</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-5xl leading-none font-bold tracking-tight text-black">
              {bottomline.average_score.toFixed(1)}
            </span>
            <span className="pb-1 text-sm text-neutral-500">out of 5</span>
          </div>
          <div className="mt-3">
            <StarRow score={bottomline.average_score} color="#000" />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Based on {bottomline.total_review}{" "}
            {bottomline.total_review === 1 ? "review" : "reviews"}
          </p>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="mt-2 text-xs font-semibold text-black transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
          >
            How reviews work?
          </button>

          {handle && productTitle ? (
            <div className="mt-4">
              <WriteReviewButton handle={handle} productTitle={productTitle} />
            </div>
          ) : null}

          <div className="mt-5 grid gap-0.5 border-t border-neutral-200 pt-4">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = bottomline.star_distribution[star];
              const pct = bottomline.total_review > 0 ? (count / bottomline.total_review) * 100 : 0;
              const selected = minRating === star && maxRating === star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => toggleRating(star)}
                  aria-pressed={selected}
                  aria-label={
                    (selected ? "Clear filter for " : "Show ") +
                    star +
                    " star reviews, " +
                    count +
                    " total"
                  }
                  className={
                    "flex w-full items-center gap-2 rounded px-1 py-1 text-xs hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none " +
                    (selected ? "bg-neutral-100" : "")
                  }
                >
                  <span className="flex w-6 items-center justify-end gap-0.5 text-black">
                    {star}
                    <Star filled color="#000" className="h-3 w-3" />
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <span className="block h-full bg-black" style={{ width: pct + "%" }} />
                  </span>
                  <span
                    className={
                      "w-6 text-right " + (count === 0 ? "text-neutral-400" : "text-black")
                    }
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-1">
          <p className="text-base font-semibold text-black">Filters</p>
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-black">Rating score</legend>
            <RatingRange
              min={minRating}
              max={maxRating}
              onChange={(min, max) => {
                setMinRating(min);
                setMaxRating(max);
                setShown(pageSize);
              }}
            />
          </fieldset>
          <p className="mt-6 text-xs font-semibold text-black">Show only reviews</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={withPhotos}
              aria-label="With customer pictures"
              onClick={togglePhotos}
              className={
                "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none " +
                (withPhotos ? "bg-black" : "bg-neutral-300")
              }
            >
              <span
                className={
                  "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform " +
                  (withPhotos ? "translate-x-5" : "")
                }
              />
            </button>
            <span className="text-xs text-black">With customer pictures</span>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!filtersActive}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-neutral-400 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400 disabled:hover:bg-white"
          >
            Reset filters
            <Trash2Icon className="size-3.5" />
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <TopPhotoReviews reviews={topPhotoReviews} onOpen={(id) => openViewer(id, 0)} />

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-black">Reviews</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-black">
            <label className="relative block">
              <span className="sr-only">Search reviews</span>
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search reviews"
                className={controlClass + " w-44 pl-8 placeholder:text-neutral-500"}
              />
            </label>
            <div className="flex items-center gap-2">
              <label htmlFor="reviews-sort">Sort by:</label>
              <select
                id="reviews-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={controlClass}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-neutral-200 bg-white py-10 text-center text-sm text-neutral-500">
              No reviews match your {query ? "search or filters" : "filters"}.
            </p>
          ) : (
            filtered
              .slice(0, shown)
              .map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onOpenPhoto={(photo) => openViewer(review.id, photo)}
                />
              ))
          )}
        </div>

        {filtered.length > shown ? (
          <div className="flex justify-center pt-5">
            <button
              type="button"
              onClick={() => setShown((n) => n + pageSize)}
              className="rounded-full border border-black px-6 py-3 text-xs font-bold text-black hover:bg-neutral-50"
            >
              Show more reviews
            </button>
          </div>
        ) : null}
      </div>

      {viewing ? (
        <UgcMediaViewer
          reviews={photoReviews}
          review={viewing.review}
          photo={viewing.photo}
          fallbackTitle={productTitle}
          onChange={(review, photo) => setViewing({ review, photo })}
          onClose={() => setViewing(null)}
        />
      ) : null}

      <HowReviewsWork
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        showProductNote={reviews.some((r) => r.product)}
      />
    </div>
  );
}
