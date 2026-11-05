import {ProductCard} from '~/components/product-card/product-card';
import type {ProductCardData} from '~/components/product-card/types';
import {
  Slider,
  SliderContent,
  SliderFade,
  SliderHeader,
  SliderItem,
  SliderNav,
} from '~/components/ui/slider';

const COPY = {
  title: 'Pairs well with',
};

const NAV_HEADER = [
  'flex shrink-0 gap-2',
  '[&_button]:flex [&_button]:size-10 [&_button]:items-center [&_button]:justify-center',
  '[&_button]:rounded-full [&_button]:bg-foreground [&_button]:text-background',
  '[&_button]:shadow-ds-drop-sm [&_button]:transition-colors [&_button]:duration-200',
  '[&_button:disabled]:bg-muted [&_button:disabled]:text-muted-foreground',
].join(' ');

// Compatible accessories (Shopify COMPLEMENTARY recommendations) as a carousel.
export function PairsWellWithSection({products}: {products: ProductCardData[]}) {
  if (products.length === 0) return null;
  return (
    <div className="min-w-0 max-w-full" data-slot="pairs-well-with">
      <Slider aria-label={COPY.title}>
        <SliderHeader className="items-center">
          <h2 className="font-display tracking-tight text-ds-h2 font-semibold">{COPY.title}</h2>
          <SliderNav className={NAV_HEADER} />
        </SliderHeader>
        <div className="relative min-w-0">
          <SliderContent className="gap-ds-regular">
            {products.map((product) => (
              <SliderItem key={product.id} className="w-56 sm:w-64">
                <ProductCard product={product} />
              </SliderItem>
            ))}
          </SliderContent>
          <SliderFade side="left" />
          <SliderFade />
        </div>
      </Slider>
    </div>
  );
}
