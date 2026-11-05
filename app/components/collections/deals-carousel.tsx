// Path: app/components/collections/deals-carousel.tsx
import type {ReactNode} from 'react';
import {Slider, SliderContent, SliderFade, SliderHeader, SliderNav} from '~/components/ui/slider';

const NAV_CIRCLES =
  'gap-ds-xsmall [&_button]:flex [&_button]:size-9 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-full [&_button]:bg-foreground [&_button]:text-background [&_button:disabled]:bg-muted [&_button:disabled]:text-muted-foreground';

export function DealsCarousel({title, children}: {title: string; children: ReactNode}) {
  return (
    <Slider aria-label={title} className="mb-8">
      <SliderHeader>
        <h2 className="text-ds-medium font-semibold sm:text-2xl">{title}</h2>
        <SliderNav className={NAV_CIRCLES} />
      </SliderHeader>
      <div className="relative min-w-0">
        <SliderContent className="gap-ds-regular">{children}</SliderContent>
        <SliderFade side="left" />
        <SliderFade />
      </div>
    </Slider>
  );
}
