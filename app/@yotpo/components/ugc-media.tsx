// Path: @yotpo/components/ugc-media.tsx
//
// Side viewer for customer photos (UGC media). Opens from a photo in the top strip or on a review
// card, shows one review's photos next to its details, and steps through all reviews with photos.
//
// - Photo-only: YotpoReview has no video field.
// - Mounted only while open; the parent owns which review and photo are shown.
// - Esc, the backdrop and the X close it; focus returns to the element that opened it.

import { BadgeCheckIcon, ThumbsUpIcon, XIcon } from "lucide-react";
import Image from "./remote-image";
import Link from "~/components/ui/localized-link";
import { useEffect, useId, useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "~/components/ui/icons";

import type { YotpoCollectionReview, YotpoReview } from "../types";
import { StarRow } from "./star";

export type UgcReview = YotpoReview & { product?: YotpoCollectionReview["product"] };
type Photo = { full: string; thumb: string };

const roundButton =
  "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground/50 disabled:hover:opacity-100";

function photosOf(review: UgcReview): Photo[] {
  return (review.images_data ?? []).flatMap((image) => {
    const full = image.original_url ?? image.thumb_url;
    const thumb = image.thumb_url ?? image.original_url;
    return full && thumb ? [{ full, thumb }] : [];
  });
}

// UTC keeps server and browser output identical.
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

// Keyed by review id in the viewer, so "Show more" resets when the review changes.
function ReviewDetails({ review }: { review: UgcReview }) {
  const [expanded, setExpanded] = useState(false);
  const name = review.user?.display_name?.trim() || "Anonymous";
  const date = shortDate(review.created_at);
  const long = review.content.length > 280;

  return (
    <article className="mt-4 rounded-ds-md bg-card p-5 shadow-ds-drop-xs">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-black">
        <span>{name}</span>
        {review.verified_buyer ? (
          <span className="inline-flex items-center gap-1 rounded bg-[#dbe4f7] px-1.5 py-0.5 text-xs font-medium text-black">
            <BadgeCheckIcon className="size-3.5" />
            Verified purchase
          </span>
        ) : null}
      </p>
      {date ? <p className="mt-1 text-xs text-neutral-700">Reviewed {date}</p> : null}
      <div className="mt-2 flex items-center gap-2">
        <StarRow score={review.score} color="#000" starClassName="h-5 w-5" />
        <span className="text-sm font-semibold text-black">{review.score}/5</span>
      </div>
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
      {review.product || review.votes_up > 0 ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-ds-md border border-border px-3 py-2 text-xs">
          {review.product ? (
            <div className="min-w-0">
              <p className="truncate text-neutral-700">{review.product.title}</p>
              <Link
                href={"/products/" + review.product.handle}
                className="font-semibold text-black underline-offset-2 hover:underline"
              >
                See item
              </Link>
            </div>
          ) : (
            <span />
          )}
          <span
            aria-label={review.votes_up + " found this helpful"}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 px-2 py-1 text-black"
          >
            {review.votes_up}
            <ThumbsUpIcon className="size-3.5" />
          </span>
        </div>
      ) : null}
    </article>
  );
}

export function UgcMediaViewer({
  reviews,
  review,
  photo,
  fallbackTitle,
  onChange,
  onClose,
}: {
  reviews: UgcReview[];
  /** Index into `reviews`. */
  review: number;
  /** Index into that review's photos. */
  photo: number;
  fallbackTitle?: string;
  onChange: (review: number, photo: number) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = reviews[review];
  const photos = current ? photosOf(current) : [];
  const photoIndex = Math.max(0, Math.min(photo, photos.length - 1));
  const active = photos[photoIndex];

  function goPhoto(delta: number) {
    const next = photoIndex + delta;
    if (next >= 0 && next < photos.length) onChange(review, next);
  }

  function goReview(delta: number) {
    const next = review + delta;
    if (next >= 0 && next < reviews.length) onChange(next, 0);
  }

  // Lock page scroll, focus the close button, and give focus back to the opener on close.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goPhoto(-1);
      } else if (e.key === "ArrowRight") {
        goPhoto(1);
      } else if (e.key === "Tab") {
        const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  if (!current || !active) return null;

  const name = current.user?.display_name?.trim() || "Anonymous";
  const title = current.product?.title ?? fallbackTitle ?? "Customer photos";

  return (
    <div className="fixed inset-0 z-50" data-ugc-media="">
      <div
        onClick={onClose}
        className="absolute inset-0 animate-in bg-black/50 duration-300 fade-in motion-reduce:animate-none"
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full animate-in flex-col bg-background shadow-xl duration-300 slide-in-from-right motion-reduce:animate-none md:w-[min(62rem,calc(100vw-4rem))]"
      >
        <header className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-4 px-6 py-4">
          <span aria-hidden="true" />
          <h2 id={titleId} className="truncate text-center text-sm font-semibold text-black">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-black hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
          >
            <XIcon className="size-6" />
          </button>
        </header>

        <div className="grid flex-1 gap-6 overflow-y-auto px-6 pb-6 md:grid-cols-[minmax(0,1fr)_21rem] md:items-start">
          <div className="min-w-0">
            <div className="relative h-[50vh] overflow-hidden rounded-ds-md bg-muted md:h-[calc(100vh-14rem)]">
              <Image
                key={active.full}
                src={active.full}
                alt={
                  "Photo " +
                  (photoIndex + 1) +
                  " of " +
                  photos.length +
                  " from " +
                  name +
                  "'s review"
                }
                fill
                unoptimized
                sizes="(min-width: 768px) 40rem, 100vw"
                className="object-contain"
              />
            </div>
            {photos.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  aria-label="Previous photo"
                  disabled={photoIndex === 0}
                  onClick={() => goPhoto(-1)}
                  className={roundButton}
                >
                  <ChevronLeftIcon aria-hidden="true" className="size-5" />
                </button>
                {photos.map((item, i) => (
                  <button
                    key={item.full}
                    type="button"
                    aria-label={"Show photo " + (i + 1)}
                    aria-current={i === photoIndex}
                    onClick={() => onChange(review, i)}
                    className={
                      "relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-muted focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none " +
                      (i === photoIndex ? "ring-2 ring-black" : "opacity-70 hover:opacity-100")
                    }
                  >
                    <Image
                      src={item.thumb}
                      alt=""
                      fill
                      unoptimized
                      sizes="40px"
                      className="object-cover"
                    />
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next photo"
                  disabled={photoIndex === photos.length - 1}
                  onClick={() => goPhoto(1)}
                  className={roundButton}
                >
                  <ChevronRightIcon aria-hidden="true" className="size-5" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3 rounded-ds-md bg-muted px-3 py-3">
              <button
                type="button"
                aria-label="Previous review"
                disabled={review === 0}
                onClick={() => goReview(-1)}
                className={roundButton}
              >
                <ChevronLeftIcon aria-hidden="true" className="size-5" />
              </button>
              <span aria-live="polite" className="text-xs font-semibold text-black">
                Review ({review + 1}/{reviews.length})
              </span>
              <button
                type="button"
                aria-label="Next review"
                disabled={review === reviews.length - 1}
                onClick={() => goReview(1)}
                className={roundButton}
              >
                <ChevronRightIcon aria-hidden="true" className="size-5" />
              </button>
            </div>
            <ReviewDetails key={current.id} review={current} />
          </div>
        </div>
      </section>
    </div>
  );
}
