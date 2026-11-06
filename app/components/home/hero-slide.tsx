import {Image} from '@shopify/hydrogen';
import LocalizedLink from '~/components/ui/localized-link';
import type {HeroSlide} from '~/lib/home';

export function HeroSlideView({
  slide,
  priority = false,
  headingLevel = 'h2',
}: {
  slide: HeroSlide;
  priority?: boolean;
  headingLevel?: 'h1' | 'h2';
}) {
  const Heading = headingLevel;
  const eager = priority ? 'eager' : 'lazy';
  const fp = priority ? 'high' : 'auto';

  // Banner slide: text and button are part of the image, so the whole slide is the link.
  if (!slide.heading) {
    return (
      <div className="relative w-full shrink-0 snap-center overflow-hidden">
        <Heading className="sr-only">{slide.alt}</Heading>
        {slide.mobileImage ? (
          <>
            <Image src={slide.mobileImage} alt="" sizes="100vw" style={{aspectRatio: 390 / 350}} loading={eager} {...{fetchpriority: fp}} className="h-auto w-full md:hidden" />
            <Image src={slide.image} alt="" sizes="100vw" style={{aspectRatio: 1440 / 402}} loading={eager} {...{fetchpriority: fp}} className="hidden h-auto w-full md:block" />
          </>
        ) : (
          <Image src={slide.image} alt="" sizes="100vw" loading={eager} {...{fetchpriority: fp}} className="h-auto w-full" />
        )}
        <LocalizedLink href={slide.href} aria-label={slide.cta ?? slide.alt} className="absolute inset-0" />
      </div>
    );
  }

  return (
    <div className="relative aspect-4/5 w-full shrink-0 snap-center overflow-hidden md:aspect-4/1">
      <Image src={slide.image} alt={slide.alt} sizes="100vw" loading={eager} {...{fetchpriority: fp}} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-overlay-dark/30" />
      <div className="relative flex h-full flex-col items-center justify-center gap-ds-small px-ds-regular text-center text-overlay-light lg:px-ds-large">
        <Heading className="max-w-3xl font-display tracking-tight text-ds-h1">{slide.heading}</Heading>
        {slide.text ? <p className="max-w-xl text-ds-regular">{slide.text}</p> : null}
        {slide.cta ? (
          <LocalizedLink
            href={slide.href}
            className="mt-ds-xsmall rounded-full bg-overlay-light px-ds-medium py-ds-small text-ds-regular font-medium text-overlay-dark"
          >
            {slide.cta}
          </LocalizedLink>
        ) : null}
      </div>
    </div>
  );
}
