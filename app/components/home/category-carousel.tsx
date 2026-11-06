import {Image} from '@shopify/hydrogen';
import {ImagePlaceholder} from '~/components/ui/image-placeholder';
import LocalizedLink from '~/components/ui/localized-link';
import {Slider, SliderContent, SliderFade, SliderHeader, SliderItem, SliderNav} from '~/components/ui/slider';
import type {ShopCategory} from '~/lib/home';

// Circular filled arrows, styled from outside so ui/slider.tsx stays untouched.
const NAV_CIRCLES =
  'gap-ds-small [&_button]:flex [&_button]:size-10 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-full [&_button]:bg-foreground [&_button]:text-background [&_button:disabled]:bg-muted [&_button:disabled]:text-muted-foreground';

export function CategoryCarousel({title, items}: {title: string; items: ShopCategory[]}) {
  if (items.length === 0) return null;
  return (
    <Slider aria-label={title}>
      <SliderHeader>
        <h2 className="font-display tracking-tight text-ds-h2 font-semibold">{title}</h2>
        <SliderNav className={NAV_CIRCLES} />
      </SliderHeader>
      <div className="relative min-w-0">
        <SliderContent className="auto-cols-max gap-ds-regular">
          {items.map((item) => (
            <SliderItem key={item.href} className="w-40">
              <LocalizedLink
                href={item.href}
                className="group flex flex-col gap-ds-xsmall rounded-ds-md text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-ds-md bg-background">
                  {item.image ? (
                    <Image alt="" className="absolute inset-0 size-full object-contain" sizes="160px" src={item.image} />
                  ) : (
                    <ImagePlaceholder className="size-full" />
                  )}
                </div>
                <span className="text-ds-small font-semibold leading-tight">{item.label}</span>
              </LocalizedLink>
            </SliderItem>
          ))}
        </SliderContent>
        <SliderFade side="left" />
        <SliderFade />
      </div>
    </Slider>
  );
}
