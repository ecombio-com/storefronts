import {Dialog as DialogPrimitive} from '@base-ui/react/dialog';
import {Image} from '@shopify/hydrogen';
import {XIcon} from 'lucide-react';
import {createContext, useCallback, useContext, useState, type ReactNode} from 'react';

import {AutoPlayVideo} from '~/components/ui/auto-play-video';
import type {LightboxItem} from './media-types';

const COPY = {
  enlarged: (label: string) => `${label} enlarged`,
  close: 'Close',
  enlargeImage: 'Enlarge image',
};

const LightboxContext = createContext<((item: LightboxItem) => void) | null>(null);

export function Lightbox({label, children}: {label: string; children: ReactNode}) {
  const [activeItem, setActiveItem] = useState<LightboxItem | null>(null);
  const close = useCallback(() => setActiveItem(null), []);

  return (
    <LightboxContext.Provider value={setActiveItem}>
      {children}

      <DialogPrimitive.Root open={activeItem !== null} onOpenChange={(open) => !open && close()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-60 bg-scrim backdrop-blur-(--scrim-blur) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0" />
          <DialogPrimitive.Popup
            className="fixed inset-0 z-60 flex items-center justify-center p-10 outline-none data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0"
            aria-describedby={undefined}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <DialogPrimitive.Title className="sr-only">{COPY.enlarged(label)}</DialogPrimitive.Title>

            <DialogPrimitive.Close className="pointer-events-auto absolute top-4 right-4 z-10 rounded-full bg-overlay-dark/50 p-2 text-overlay-light transition-opacity hover:opacity-80 focus:ring-2 focus:ring-overlay-light focus:outline-hidden">
              <XIcon className="size-5" />
              <span className="sr-only">{COPY.close}</span>
            </DialogPrimitive.Close>

            {activeItem?.type === 'image' && (
              <div
                className="pointer-events-none relative h-full max-w-full bg-background"
                style={{
                  aspectRatio:
                    activeItem.image.width && activeItem.image.height
                      ? `${activeItem.image.width} / ${activeItem.image.height}`
                      : '1 / 1',
                }}
              >
                <Image
                  data={activeItem.image}
                  alt={activeItem.image.altText || COPY.enlarged(label)}
                  className="absolute inset-0 size-full object-contain"
                  sizes="90vw"
                  loading="eager"
                />
              </div>
            )}

            {activeItem?.type === 'video' && (
              <div className="pointer-events-none flex h-full w-full items-center justify-center">
                <AutoPlayVideo
                  src={activeItem.video.url}
                  previewImage={
                    activeItem.video.previewImage
                      ? {
                          src: activeItem.video.previewImage.url,
                          alt: activeItem.video.previewImage.altText || '',
                        }
                      : null
                  }
                  sizes="90vw"
                  previewImageLoading="eager"
                  className="pointer-events-auto max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </LightboxContext.Provider>
  );
}

export function LightboxTrigger({item, children}: {item: LightboxItem; children: ReactNode}) {
  const open = useContext(LightboxContext);
  return (
    <button
      type="button"
      aria-label={COPY.enlargeImage}
      onClick={() => open?.(item)}
      className="relative h-full w-full cursor-zoom-in"
    >
      {children}
    </button>
  );
}
