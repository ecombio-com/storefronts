// Path: app/components/blog/article-widgets.tsx
import {ChevronRightIcon, ListIcon, Share2Icon} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Sheet, SheetContent, SheetTitle} from '~/components/ui/sheet';

export function ShareButton({title}: {title: string}) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({title, url});
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The person closed the share sheet, or the clipboard is blocked.
    }
  };
  return (
    <button
      className="inline-flex items-center gap-(--spacer-xsmall) font-medium transition-opacity hover:opacity-70"
      onClick={share}
      type="button"
    >
      <span aria-live="polite">{copied ? 'Link copied' : 'Share article'}</span>
      <Share2Icon aria-hidden="true" className="size-4" />
    </button>
  );
}

// Show the button once the reader is this far down the page (0 to 1).
const SHOW_AT = 0.4;

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollable > 0 && window.scrollY / scrollable >= SHOW_AT);
    }
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  function scrollToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top: 0, behavior: reduceMotion ? 'auto' : 'smooth'});
  }
  return (
    <button
      aria-hidden={!visible}
      className={`fixed right-6 bottom-6 z-40 flex items-center gap-1 border bg-background px-3 py-2 text-ds-small transition-opacity duration-200 hover:bg-muted ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={scrollToTop}
      tabIndex={visible ? 0 : -1}
      type="button"
    >
      Back to top <span aria-hidden>↑</span>
    </button>
  );
}

// Publishes article reading progress (0 to 1) as --reading-progress on <html>.
// The header renders the actual bar; data-reading tells it an article is on screen.
export function ReadingProgress({targetSelector = '[data-article-body]'}: {targetSelector?: string}) {
  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress =
        total <= 0 ? (rect.top <= 0 ? 1 : 0) : Math.min(1, Math.max(0, -rect.top / total));
      root.style.setProperty('--reading-progress', String(progress));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    root.dataset.reading = '';
    update();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(target);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.reading;
      root.style.removeProperty('--reading-progress');
    };
  }, [targetSelector]);
  return null;
}

export function ArticleToc({items}: {items: Array<{id: string; text: string}>}) {
  const [open, setOpen] = useState(false);
  if (items.length < 2) return null;
  const go = (id: string) => {
    setOpen(false);
    // Wait for the drawer to finish closing and release its scroll lock.
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
      window.history.replaceState(null, '', `#${id}`);
    }, 350);
  };
  return (
    <>
      <button
        className="fixed bottom-(--spacer-medium) left-(--spacer-regular) z-40 inline-flex items-center gap-(--spacer-small) rounded-ds-md bg-(--color-text-dark) px-(--spacer-regular) py-(--spacer-small) font-semibold text-(--color-text-light) text-ds-small shadow-(--shadow-drop-md) transition-opacity hover:opacity-90"
        onClick={() => setOpen(true)}
        type="button"
      >
        <ListIcon aria-hidden="true" className="size-4" />
        Table of contents
      </button>
      <Sheet onOpenChange={(next) => setOpen(next)} open={open}>
        <SheetContent className="gap-0 overflow-y-auto" side="left">
          <SheetTitle className="border-b p-(--spacer-regular) text-center">
            Table of contents
          </SheetTitle>
          <ol>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className="flex w-full items-center justify-between gap-(--spacer-regular) border-b px-(--spacer-regular) py-(--spacer-regular) text-left text-ds-regular transition-colors hover:bg-muted"
                  onClick={() => go(item.id)}
                  type="button"
                >
                  {item.text}
                  <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0" />
                </button>
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>
    </>
  );
}
