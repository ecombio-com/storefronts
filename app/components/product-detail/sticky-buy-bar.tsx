import {Image} from '@shopify/hydrogen';
import {useEffect, useRef, useState, type ReactNode} from 'react';

const COPY = {
  add: 'Add to cart',
};

// Appears at the top of the screen whenever the main buy buttons have scrolled off screen, in both
// scroll directions. While it shows, it sets html[data-buy-bar="on"] so the header script keeps the
// site header hidden. It also publishes --buy-bar-offset so sticky elements (tabs, reviews filters)
// sit below the bar. A scroll-progress line runs along its bottom edge.
export function StickyBuyBar({
  targetId,
  title,
  price,
  priceNote,
  variantName,
  imageUrl,
}: {
  targetId: string;
  title: string;
  price: ReactNode;
  priceNote?: ReactNode;
  variantName?: string | null;
  imageUrl?: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      const el = document.getElementById(targetId);
      const show = !!el && el.getBoundingClientRect().bottom < 0;
      setVisible(show);
      root.dataset.buyBar = show ? 'on' : 'off';
      root.style.setProperty(
        '--buy-bar-offset',
        show && barRef.current ? `${barRef.current.offsetHeight}px` : '0px',
      );

      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
    };

    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      delete root.dataset.buyBar;
      root.style.removeProperty('--buy-bar-offset');
    };
  }, [targetId]);

  // Reuse the real Add to Cart button so cart logic, validation and the cart drawer stay in one place.
  const handleClick = () => {
    document.querySelector<HTMLButtonElement>(`#${targetId} button:not([type="button"])`)?.click();
  };

  return (
    <div
      ref={barRef}
      aria-hidden={!visible}
      // React 18.3 has no `inert` prop type, so it is spread in.
      {...({inert: visible ? undefined : ''} as object)}
      className={`fixed inset-x-0 top-0 z-40 bg-white pt-[env(safe-area-inset-top,0px)] transition-transform duration-200 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
      data-slot="sticky-buy-bar"
    >
      <div className="ds-container flex items-center justify-between gap-ds-regular py-ds-small">
        <div className="flex min-w-0 items-center gap-ds-regular">
          {imageUrl ? (
            <Image
              data={{url: imageUrl, altText: ''}}
              alt=""
              width={56}
              height={56}
              sizes="56px"
              className="size-14 shrink-0 object-contain"
            />
          ) : null}
          <span className="hidden min-w-0 truncate text-ds-regular font-medium sm:block">
            {variantName || title}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-ds-medium">
          <span className="flex items-baseline gap-ds-xsmall tabular-nums">
            <span className="text-ds-h3 font-bold">{price}</span>
            {priceNote ? (
              <span className="hidden text-ds-small font-semibold underline sm:inline">
                {priceNote}
              </span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={handleClick}
            className="h-11 min-w-40 cursor-pointer rounded-ds-md bg-(--color-text-dark) px-ds-large text-ds-regular font-semibold text-white sm:min-w-56"
          >
            {COPY.add}
          </button>
        </div>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-border-subtle">
        <div
          ref={progressRef}
          className="h-full origin-left bg-foreground"
          style={{transform: 'scaleX(0)'}}
        />
      </div>
    </div>
  );
}
