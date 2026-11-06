import {HeroSlideView} from '~/components/home/hero-slide';
import {HeroSlideshow} from '~/components/home/hero-slideshow';
import type {HeroSlide} from '~/lib/home';

export function Hero({slides}: {slides: HeroSlide[]}) {
  const first = slides[0];
  if (!first) return null;
  if (slides.length === 1) return <HeroSlideView slide={first} priority headingLevel="h1" />;
  return <HeroSlideshow slides={slides} />;
}
