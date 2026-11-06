import {Image} from '@shopify/hydrogen';
import {XIcon} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {Dialog, DialogClose, DialogContent, DialogTitle} from '~/components/ui/dialog';
import LocalizedLink from '~/components/ui/localized-link';
import type {CommunityStory} from '~/lib/home';

function Stars({rating}: {rating: number}) {
  return (
    <span className="flex items-center gap-ds-xsmall" aria-label={`${rating} out of 5`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({length: 5}, (_, i) => (
          <svg key={i} viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className={i < rating ? '' : 'opacity-30'}>
            <path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z" />
          </svg>
        ))}
      </span>
      <span className="text-ds-small">{rating}/5</span>
    </span>
  );
}

function SoundCue() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function ProductRow({product}: {product: NonNullable<CommunityStory['product']>}) {
  return (
    <LocalizedLink href={`/products/${product.handle}`} className="flex items-center gap-ds-small p-ds-small hover:bg-muted/50">
      {product.image ? (
        <Image src={product.image} alt="" width={48} className="size-12 shrink-0 rounded-ds-md object-contain" />
      ) : null}
      <span className="flex min-w-0 flex-col">
        <span className="line-clamp-2 text-ds-small font-medium">{product.title}</span>
        {product.price ? <span className="text-ds-small text-muted-foreground">{product.price}</span> : null}
      </span>
    </LocalizedLink>
  );
}

// Plays with sound. Starting it pauses every other video on the page, and a BroadcastChannel
// pauses it if another tab, window or preview frame starts its own.
function ModalVideo({story}: {story: CommunityStory}) {
  const ref = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [id] = useState(() => Math.random().toString(36).slice(2));

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('ecombio-story-video');
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<{from?: string}>) => {
      if (event.data?.from !== id) ref.current?.pause();
    };
    if (ref.current && !ref.current.paused) channel.postMessage({from: id});
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [id]);

  const handlePlay = () => {
    const self = ref.current;
    for (const other of document.querySelectorAll('video')) {
      if (other !== self) other.pause();
    }
    channelRef.current?.postMessage({from: id});
  };

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption -- story clips have no caption files yet
    <video
      ref={ref}
      autoPlay
      controls
      loop
      playsInline
      poster={story.poster}
      onPlay={handlePlay}
      className="block aspect-9/16 h-[min(60dvh,32rem)] w-auto max-w-full object-contain md:h-[min(85dvh,40rem)]"
    >
      <source src={story.video} type="video/mp4" />
    </video>
  );
}

// No `panel` prop yet: the modal shows a product link until the buy block is ported.
export function StoryCard({story}: {story: CommunityStory}) {
  const [open, setOpen] = useState(false);
  const text = story.review ?? story.caption;

  return (
    <div className="overflow-hidden rounded-ds-lg bg-background shadow-ds-drop-sm">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Watch with sound: ${story.alt}`}
        className="relative block aspect-9/16 w-full overflow-hidden bg-muted text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <video muted playsInline preload={story.poster ? 'none' : 'metadata'} poster={story.poster} className="size-full object-cover">
          <source src={story.video} type="video/mp4" />
        </video>

        {story.reviewer ? (
          <span className="absolute left-3 top-3 rounded-ds-md bg-overlay-light px-ds-xsmall py-ds-xxsmall text-ds-small font-medium text-overlay-dark">
            {story.reviewer}
          </span>
        ) : null}

        <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-overlay-dark/50 text-overlay-light">
          <SoundCue />
        </span>

        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-overlay-dark/50 text-overlay-light">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>

        {text || story.rating ? (
          <span className="absolute inset-x-0 bottom-0 flex flex-col gap-ds-xsmall bg-linear-to-t from-overlay-dark/70 to-transparent p-ds-small pt-ds-large text-overlay-light">
            {text ? <span className="line-clamp-4 text-ds-small">{text}</span> : null}
            {story.rating ? <Stars rating={story.rating} /> : null}
          </span>
        ) : null}
      </button>

      {story.product ? <ProductRow product={story.product} /> : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-dvh gap-0 overflow-y-auto p-0 max-sm:h-dvh max-sm:max-w-full max-sm:rounded-none sm:max-h-[calc(100dvh-2rem)] sm:max-w-sm md:max-w-5xl md:grid-cols-[auto_minmax(0,1fr)] md:overflow-hidden"
        >
          <DialogTitle className="sr-only">{story.alt}</DialogTitle>
          <div className="flex items-center justify-center bg-overlay-dark">
            <ModalVideo story={story} />
          </div>
          {story.product ? (
            <div className="flex flex-col gap-ds-regular p-ds-regular [scrollbar-width:thin] md:max-h-[min(85dvh,40rem)] md:overflow-y-auto md:p-ds-medium">
              <div className="mt-ds-xsmall overflow-hidden rounded-ds-lg border">
                <ProductRow product={story.product} />
              </div>
            </div>
          ) : null}
          <DialogClose
            aria-label="Close video"
            className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-overlay-dark/50 text-overlay-light transition-colors hover:bg-overlay-dark/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-overlay-light"
          >
            <XIcon className="size-5" aria-hidden="true" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
