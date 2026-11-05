import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';

type Img = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};
type MediaNode = {
  mediaContentType: string;
  id?: string;
  image?: Img | null;
  previewImage?: Img | null;
  sources?: {url: string; mimeType: string}[] | null;
};

const thumbOf = (m: MediaNode): Img | null => m.image ?? m.previewImage ?? null;

// Remount with key={variantId} so the gallery jumps to the selected variant's image.
export function ProductGallery({
  media,
  title,
  activeUrl,
  className = '',
}: {
  media: MediaNode[];
  title: string;
  activeUrl?: string | null;
  className?: string;
}) {
  const items = media.filter(
    (m) => m.mediaContentType === 'IMAGE' || m.mediaContentType === 'VIDEO',
  );
  const initial = Math.max(
    0,
    items.findIndex((m) => thumbOf(m)?.url === activeUrl),
  );
  const [index, setIndex] = useState(initial);
  const [zoomed, setZoomed] = useState(false);
  const current = items[index] ?? items[0];

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % items.length);
      if (e.key === 'ArrowLeft')
        setIndex((i) => (i - 1 + items.length) % items.length);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed, items.length]);

  if (!current) {
    return <div className={`aspect-square rounded-lg bg-muted ${className}`} />;
  }
  const img = thumbOf(current);
  const isVideo = current.mediaContentType === 'VIDEO';

  return (
    <div className={`grid gap-3 ${className}`}>
      <div className="overflow-hidden rounded-lg bg-muted">
        {isVideo ? (
          <video
            key={current.id}
            controls
            playsInline
            poster={img?.url}
            className="aspect-square w-full object-cover"
          >
            {(current.sources ?? []).map((s) => (
              <source key={s.url} src={s.url} type={s.mimeType} />
            ))}
          </video>
        ) : img ? (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Enlarge image"
            className="block h-full w-full cursor-zoom-in"
          >
            <Image
              key={current.id}
              data={{...img, altText: img.altText || title}}
              sizes="(min-width: 1024px) 60vw, 100vw"
              loading={index === 0 ? 'eager' : 'lazy'}
              className="aspect-square w-full object-cover"
            />
          </button>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((m, i) => {
            const t = thumbOf(m);
            if (!t) return null;
            return (
              <button
                key={m.id ?? i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${m.mediaContentType === 'VIDEO' ? 'video' : 'image'} ${i + 1}`}
                aria-current={i === index}
                className={`relative size-20 shrink-0 overflow-hidden rounded-md ring-2 ${
                  i === index ? 'ring-foreground' : 'ring-transparent'
                }`}
              >
                <Image data={t} width={160} sizes="80px" className="size-full object-cover" />
                {m.mediaContentType === 'VIDEO' ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/30 text-xs text-white">▶</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {zoomed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} enlarged`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm md:p-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomed(false);
          }}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-black/50 text-xl text-white hover:opacity-80"
          >
            ×
          </button>
          {items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
                className="absolute left-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-xl text-white hover:opacity-80"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setIndex((i) => (i + 1) % items.length)}
                className="absolute right-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-xl text-white hover:opacity-80"
              >
                ›
              </button>
            </>
          ) : null}
          {isVideo ? (
            <video
              key={current.id}
              controls
              autoPlay
              playsInline
              poster={img?.url}
              className="max-h-full max-w-full object-contain"
            >
              {(current.sources ?? []).map((s) => (
                <source key={s.url} src={s.url} type={s.mimeType} />
              ))}
            </video>
          ) : img ? (
            <Image
              key={current.id}
              data={{...img, altText: img.altText || `${title} enlarged`}}
              sizes="90vw"
              loading="eager"
              className="max-h-full max-w-full bg-white object-contain"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
