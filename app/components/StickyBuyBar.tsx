import {useEffect, useRef, useState, type ReactNode} from 'react';

// Slides in at the top once the main buy block has scrolled off screen.
// Clicks the real Add to cart button so cart logic stays in one place.
export function StickyBuyBar({
  targetId,
  title,
  price,
  imageUrl,
}: {
  targetId: string;
  title: string;
  price: ReactNode;
  imageUrl?: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(targetId);
      const show = !!el && el.getBoundingClientRect().bottom < 0;
      setVisible(show);
      if (show) document.documentElement.dataset.buyBar = 'on';
      else delete document.documentElement.dataset.buyBar;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${p})`;
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      delete document.documentElement.dataset.buyBar;
    };
  }, [targetId]);

  const click = () =>
    document
      .querySelector<HTMLButtonElement>(`#${targetId} button:not([type="button"])`)
      ?.click();

  return (
    <div
      aria-hidden={!visible}
      {...({inert: visible ? undefined : ''} as object)}
      className={`fixed inset-x-0 top-0 z-40 bg-white transition-transform duration-200 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          {imageUrl ? (
            <img src={imageUrl} alt="" width={56} height={56} className="size-14 shrink-0 object-contain" />
          ) : null}
          <span className="hidden min-w-0 truncate font-medium sm:block">{title}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xl font-bold tabular-nums">{price}</span>
          <button
            type="button"
            onClick={click}
            className="h-11 min-w-40 cursor-pointer rounded-md bg-black px-6 font-semibold text-white sm:min-w-56"
          >
            Add to cart
          </button>
        </div>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-black/10">
        <div ref={progress} className="h-full origin-left bg-black" style={{transform: 'scaleX(0)'}} />
      </div>
    </div>
  );
}

