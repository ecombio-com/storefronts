import {useCallback, useEffect, useRef, useState} from 'react';
import {HeroSlideView} from '~/components/home/hero-slide';
import type {HeroSlide} from '~/lib/home';

function Chevron({direction}: {direction: 'left' | 'right'}) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}

export function HeroSlideshow({slides, interval = 6000}: {slides: HeroSlide[]; interval?: number}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (el) el.scrollTo({left: i * el.clientWidth, behavior: 'smooth'});
  }, []);
  const step = (dir: 1 | -1) => goTo((index + dir + slides.length) % slides.length);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => goTo((index + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [index, paused, slides.length, interval, goTo]);

  const arrowClass =
    'absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-overlay-light/70 p-2 text-overlay-dark transition hover:bg-overlay-light md:block';

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <HeroSlideView key={slide.id ?? `${i}-${slide.image}`} slide={slide} priority={i === 0} headingLevel={i === 0 ? 'h1' : 'h2'} />
        ))}
      </div>
      <button type="button" aria-label="Previous slide" onClick={() => step(-1)} className={`${arrowClass} left-[4%]`}>
        <Chevron direction="left" />
      </button>
      <button type="button" aria-label="Next slide" onClick={() => step(1)} className={`${arrowClass} right-[4%]`}>
        <Chevron direction="right" />
      </button>
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id ?? `${i}-${slide.image}`}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={`h-2 w-2 rounded-full ${i === index ? 'bg-overlay-light' : 'bg-overlay-light/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
