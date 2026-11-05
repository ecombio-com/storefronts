import {Image} from '@shopify/hydrogen';
import {cn} from 'cn';
import {Maximize2, Play} from 'lucide-react';
import {useEffect, useState, type KeyboardEvent} from 'react';

import {AutoPlayVideo} from '~/components/ui/auto-play-video';
import {ChevronLeftIcon, ChevronRightIcon} from '~/components/ui/icons';
import {ImagePlaceholder} from '~/components/ui/image-placeholder';

import {Lightbox, LightboxTrigger} from './lightbox';
import type {MediaImageData, MediaVideoData} from './media-types';

const COPY = {
  imageAlt: (title: string, n: number) => `${title} image ${n}`,
  imagesRegion: (title: string) => `${title} images`,
  goTo: (n: number) => `Go to image ${n}`,
  show: (n: number) => `Show image ${n}`,
  previous: 'Previous image',
  next: 'Next image',
};

type MediaItem =
  | {type: 'image'; image: MediaImageData}
  | {type: 'video'; video: MediaVideoData}
  | {type: 'placeholder'};

function itemUrl(item: MediaItem) {
  if (item.type === 'image') return item.image.url;
  if (item.type === 'video') return item.video.url;
  return 'placeholder';
}

// The desktop gallery fills the 6-of-10 column at `lg`.
const GALLERY_SIZES = '(min-width: 1024px) 60vw, 100vw';

// Desktop-only controls: visible on mouse hover, or when a control inside has keyboard focus.
// Touch devices never show them; they see the dots only.
const SHOW_ON_HOVER =
  'opacity-0 transition-opacity group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100';

const ARROW_BUTTON =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-white hover:bg-primary';

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

// Tracks which slide is in view and scrolls to a slide by index.
function useSlideScroll(count: number) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container) return;
    const sync = () => {
      const width = container.offsetWidth;
      if (width === 0) return;
      const last = Math.max(1, count) - 1;
      setSelectedIndex(Math.min(Math.max(0, Math.round(container.scrollLeft / width)), last));
    };
    sync();
    container.addEventListener('scroll', sync, {passive: true});
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(container);
    return () => {
      container.removeEventListener('scroll', sync);
      resizeObserver.disconnect();
    };
  }, [container, count]);

  const goTo = (index: number) => {
    if (!container) return;
    const next = Math.min(Math.max(index, 0), count - 1);
    container.scrollTo({left: next * container.offsetWidth, behavior: scrollBehavior()});
    setSelectedIndex(next);
  };

  return {setContainer, selectedIndex, goTo};
}

function MediaImage({
  image,
  title,
  idx,
  sizes,
  priority,
  className,
}: {
  image: MediaImageData;
  title: string;
  idx: number;
  sizes: string;
  priority: boolean;
  className?: string;
}) {
  return (
    <Image
      data={{...image, altText: image.altText || COPY.imageAlt(title, idx + 1)}}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      draggable={false}
      className={cn('absolute inset-0 size-full object-cover', className)}
    />
  );
}

function MediaVideo({
  video,
  sizes,
  priority,
  className,
}: {
  video: MediaVideoData;
  sizes: string;
  priority: boolean;
  className?: string;
}) {
  return (
    <AutoPlayVideo
      src={video.url}
      previewImage={
        video.previewImage
          ? {src: video.previewImage.url, alt: video.previewImage.altText || ''}
          : null
      }
      sizes={sizes}
      previewImageLoading={priority ? 'eager' : 'lazy'}
      className={cn('h-full w-full scale-[1.04] object-cover', className)}
    />
  );
}

function MediaContent({
  item,
  title,
  idx,
  sizes,
  priority,
  imageClassName,
}: {
  item: MediaItem;
  title: string;
  idx: number;
  sizes: string;
  priority: boolean;
  imageClassName?: string;
}) {
  if (item.type === 'video') {
    return <MediaVideo video={item.video} sizes={sizes} priority={priority} />;
  }
  if (item.type === 'placeholder') return <ImagePlaceholder className="size-full" />;
  return (
    <MediaImage
      image={item.image}
      title={title}
      idx={idx}
      sizes={sizes}
      priority={priority}
      className={imageClassName}
    />
  );
}

// Mobile: full-bleed snap carousel with dots.
function Carousel({items, title}: {items: MediaItem[]; title: string}) {
  const {setContainer, selectedIndex, goTo} = useSlideScroll(items.length);
  return (
    <div className="grid gap-5">
      <div
        ref={setContainer}
        className="relative overflow-x-auto flex snap-x snap-mandatory overscroll-x-contain scrollbar-hide -mx-5 w-[calc(100%+2.5rem)]"
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
      >
        {items.map((item, idx) => (
          <div
            key={`${idx}-${itemUrl(item)}`}
            className="relative shrink-0 w-full snap-start snap-always overflow-hidden aspect-square"
          >
            <MediaContent
              item={item}
              title={title}
              idx={idx}
              sizes="100vw"
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      {/* Dots reserve their space but hide when there is only one image. */}
      <div className={cn('flex justify-center gap-2', items.length <= 1 && 'invisible')}>
        {items.map((_, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => goTo(idx)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              idx === selectedIndex
                ? 'bg-foreground w-8'
                : 'bg-muted-foreground/30 w-1.5 hover:bg-muted-foreground/50',
            )}
            aria-label={COPY.goTo(idx + 1)}
          />
        ))}
      </div>
    </div>
  );
}

function thumbOf(item: MediaItem): MediaImageData | null {
  if (item.type === 'image') return item.image;
  if (item.type === 'video') return item.video.previewImage ?? null;
  return null;
}

// One slide of the desktop gallery: landscape frame, whole image visible.
function GalleryItem({
  item,
  title,
  idx,
}: {
  item: MediaItem;
  title: string;
  idx: number;
}) {
  const content = (
    <MediaContent
      item={item}
      title={title}
      idx={idx}
      sizes={GALLERY_SIZES}
      priority={idx === 0}
      imageClassName="object-contain"
    />
  );
  return (
    <div className="relative aspect-[3/2] w-full shrink-0 snap-start snap-always overflow-hidden bg-background">
      {item.type === 'image' ? <LightboxTrigger item={item}>{content}</LightboxTrigger> : content}
    </div>
  );
}

// Desktop: thumbnail rail on the left, 3:2 frame on the right.
function Gallery({
  items,
  title,
  interactive,
}: {
  items: MediaItem[];
  title: string;
  interactive: boolean;
}) {
  const {setContainer, selectedIndex, goTo} = useSlideScroll(items.length);
  const count = items.length;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(selectedIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(selectedIndex - 1);
    }
  };

  const gallery = (
    <div className="group relative w-full">
      <div
        ref={setContainer}
        role="region"
        aria-roledescription="carousel"
        aria-label={COPY.imagesRegion(title)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
      >
        {items.map((item, idx) => (
          <GalleryItem key={`${idx}-${itemUrl(item)}`} item={item} title={title} idx={idx} />
        ))}
      </div>

      {count > 1 && selectedIndex > 0 ? (
        <button
          type="button"
          aria-label={COPY.previous}
          onClick={() => goTo(selectedIndex - 1)}
          className={cn(ARROW_BUTTON, 'left-3', SHOW_ON_HOVER)}
        >
          <ChevronLeftIcon className="size-5" aria-hidden="true" />
        </button>
      ) : null}

      {count > 1 && selectedIndex < count - 1 ? (
        <button
          type="button"
          aria-label={COPY.next}
          onClick={() => goTo(selectedIndex + 1)}
          className={cn(ARROW_BUTTON, 'right-3', SHOW_ON_HOVER)}
        >
          <ChevronRightIcon className="size-5" aria-hidden="true" />
        </button>
      ) : null}

      {count > 1 ? (
        <div
          className={cn(
            'absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2',
            SHOW_ON_HOVER,
          )}
        >
          {items.map((_, idx) => (
            <button
              type="button"
              key={idx}
              aria-label={COPY.goTo(idx + 1)}
              aria-current={idx === selectedIndex}
              onClick={() => goTo(idx)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                idx === selectedIndex
                  ? 'w-10 bg-foreground'
                  : 'w-8 bg-foreground/25 hover:bg-foreground/50',
              )}
            />
          ))}
        </div>
      ) : null}

      {/* Decorative: the click falls through to the image, which opens the lightbox. */}
      {interactive ? (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-3 right-3 z-10 text-foreground',
            SHOW_ON_HOVER,
          )}
        >
          <Maximize2 className="size-5" />
        </span>
      ) : null}
    </div>
  );

  const body = interactive ? <Lightbox label={title}>{gallery}</Lightbox> : gallery;
  const hasRail = count > 1;

  return (
    <div className="flex items-stretch gap-ds-small">
      {hasRail ? (
        <div className="relative w-16 shrink-0">
          <ul className="scrollbar-hide absolute inset-0 grid auto-rows-max content-start gap-ds-xsmall overflow-y-auto">
            {items.map((item, idx) => {
              const thumb = thumbOf(item);
              return (
                <li key={`${idx}-${itemUrl(item)}`}>
                  <button
                    type="button"
                    aria-label={COPY.show(idx + 1)}
                    aria-current={idx === selectedIndex}
                    onClick={() => goTo(idx)}
                    className={cn(
                      'relative block aspect-square w-full overflow-hidden rounded-ds-md bg-muted ring-1 ring-inset',
                      idx === selectedIndex
                        ? 'ring-2 ring-foreground'
                        : 'ring-border hover:ring-foreground/50',
                    )}
                  >
                    {thumb ? (
                      <Image
                        data={{...thumb, altText: ''}}
                        alt=""
                        width={160}
                        sizes="64px"
                        loading="lazy"
                        className="size-full object-contain"
                      />
                    ) : null}
                    {item.type === 'video' ? (
                      <span className="absolute inset-0 grid place-items-center bg-foreground/30 text-white">
                        <Play className="size-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <div className="min-w-0 flex-1">{body}</div>
    </div>
  );
}

export function ProductMedia({
  images,
  videos,
  colorImage,
  title,
  className,
}: {
  images: MediaImageData[];
  videos: MediaVideoData[];
  /** The selected color's image. It goes first, before videos and shared images. */
  colorImage?: MediaImageData;
  title: string;
  className?: string;
}) {
  const media: MediaItem[] = [];
  if (colorImage) media.push({type: 'image', image: colorImage});
  for (const video of videos) media.push({type: 'video', video});
  for (const image of images) media.push({type: 'image', image});

  const isEmpty = media.length === 0;
  const items: MediaItem[] = isEmpty ? [{type: 'placeholder'}] : media;
  // Remount when the media set changes so both views start on the first slide.
  const setKey = items.map(itemUrl).join(',');

  return (
    <div className={className}>
      <div className="lg:hidden">
        <Carousel key={setKey} items={items} title={title} />
      </div>
      <div className="hidden lg:block">
        <Gallery key={setKey} items={items} title={title} interactive={!isEmpty} />
      </div>
    </div>
  );
}
