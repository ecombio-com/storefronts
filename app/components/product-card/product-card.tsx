import LocalizedLink from '~/components/ui/localized-link';
import {getVariantUrl} from '~/lib/variants';
import {CardAddToCart} from './card-add-to-cart';
import {
  ProductCardContent,
  ProductCardImage,
  ProductCardImageContainer,
  ProductCardPrice,
  ProductCardRating,
  ProductCard as ProductCardRoot,
  ProductCardSkeleton,
  ProductCardSwatches,
  ProductCardTitle,
} from './components';
import {getSaleInfo, SaleBadge, SaleSavings, WasPriceLine} from './sale';
import {CardStars} from './stars';
import type {ProductCardData} from './types';

const COPY = {
  featured: "Assistant's pick",
  outOfStock: 'Out of Stock',
};

export interface ProductCardProps {
  product: ProductCardData;
  variant?: 'default' | 'featured' | 'minimal';
  outOfStockText?: string;
  showSale?: boolean;
  /** Two-line spec text with a fixed height, so prices line up across a row of cards. */
  compact?: boolean;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export function ProductCard({
  product,
  variant = 'default',
  showSale = true,
  compact = false,
  outOfStockText = COPY.outOfStock,
  loading,
  className,
}: ProductCardProps) {
  const isFeatured = variant === 'featured';
  const isMinimal = variant === 'minimal';
  const compareAt = showSale ? product.compareAtPrice?.amount : undefined;
  const sale = getSaleInfo(product.price.amount, compareAt);
  const options = product.defaultVariantSelectedOptions ?? [];
  const subtitle =
    options
      .map((o) => o.value)
      .filter((v) => v !== 'Default Title')
      .join(' • ') ||
    product.vendor ||
    '';
  const subtitleText = [subtitle, ...(product.cardSpecs ?? [])].filter(Boolean).join(' • ');
  // Locale prefix is added by LocalizedLink, so build the path from "/".
  const href = getVariantUrl({
    handle: product.handle,
    pathname: '/',
    searchParams: new URLSearchParams(),
    selectedOptions: options.filter((o) => o.value !== 'Default Title'),
  });

  return (
    <LocalizedLink
      href={href}
      prefetch="intent"
      className={className}
      data-product-id={product.id}
    >
      <ProductCardRoot variant={variant}>
        {isFeatured && (
          <div data-slot="product-card-badge">
            <span className="inline-flex self-start items-center pl-2 pr-5 py-0.5 bg-primary rounded-tl-ds-md not-supports-[clip-path:shape(from_0_0)]:rounded-tr-ds-md clip-featured-badge text-ds-small text-primary-foreground font-medium">
              {COPY.featured}
            </span>
          </div>
        )}
        <ProductCardImageContainer variant={variant}>
          {isMinimal && product.label ? (
            <div className="mb-2 text-ds-small font-bold text-[#7B3DBE]">{product.label}</div>
          ) : null}
          <ProductCardImage
            image={product.featuredImage}
            alt={product.featuredImage?.altText || product.title}
            outOfStock={!product.availableForSale}
            outOfStockText={outOfStockText}
            loading={loading}
          />
          <ProductCardSwatches colors={product.colors} />
          <ProductCardContent>
            <SaleBadge price={product.price.amount} compareAt={compareAt} />
            <ProductCardTitle>{product.title}</ProductCardTitle>
            <div
              className={
                isMinimal
                  ? 'hidden'
                  : `text-ds-small text-muted-foreground ${compact ? 'min-h-[2lh] line-clamp-2' : 'min-h-8 line-clamp-3'}`
              }
            >
              {subtitleText}
            </div>
            <ProductCardRating>
              {product.rating && product.rating.count > 0 ? (
                <CardStars score={product.rating.score} count={product.rating.count} />
              ) : null}
            </ProductCardRating>
            <ProductCardPrice
              amount={product.price.amount}
              currencyCode={product.price.currencyCode}
              maxAmount={product.maxPrice.amount}
              className={sale.onSale ? 'text-positive' : undefined}
            />
            {isMinimal ? (
              <WasPriceLine
                price={product.price.amount}
                compareAt={product.compareAtPrice?.amount}
                currencyCode={product.price.currencyCode}
              />
            ) : null}
            <SaleSavings
              price={product.price.amount}
              compareAt={compareAt}
              currencyCode={product.price.currencyCode}
            />
          </ProductCardContent>
        </ProductCardImageContainer>
        <CardAddToCart hidden={isMinimal} product={product} />
      </ProductCardRoot>
    </LocalizedLink>
  );
}

export {ProductCardSkeleton};
