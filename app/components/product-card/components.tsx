import {Image} from '@shopify/hydrogen';
import {cn} from 'cn';
import type {ComponentProps, ReactNode} from 'react';

import {ImagePlaceholder} from '~/components/ui/image-placeholder';
import type {ProductCardColor} from './types';

const MAX_SWATCHES = 4;

const COPY = {
  outOfStock: 'Out of Stock',
  startingAt: 'Starting at',
  was: 'Was',
};

type Variant = 'default' | 'featured' | 'minimal';

interface ProductCardProps extends ComponentProps<'article'> {
  variant?: Variant;
}

function ProductCard({variant = 'default', className, children, ...props}: ProductCardProps) {
  return (
    <article
      data-slot="product-card"
      data-variant={variant}
      className={cn(
        'group/card flex flex-col h-full overflow-hidden rounded-ds-lg bg-white p-4 shadow-ds-drop-xs ring-1 ring-black/5 transition-shadow hover:shadow-ds-drop-sm focus-within:shadow-ds-drop-sm data-[variant=minimal]:p-3 data-[variant=minimal]:ring-0 data-[variant=minimal]:[&_[data-slot=product-card-sale-badge]]:hidden data-[variant=minimal]:[&_[data-slot=product-card-savings]]:hidden',
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}

interface ProductCardImageContainerProps extends ComponentProps<'div'> {
  variant?: Variant;
}

function ProductCardImageContainer({
  variant = 'default',
  className,
  children,
  ...props
}: ProductCardImageContainerProps) {
  return (
    <div
      data-slot="product-card-image-container"
      data-variant={variant}
      className={cn(
        'flex flex-col flex-1',
        'data-[variant=featured]:-mt-px data-[variant=featured]:bg-linear-to-b/oklch data-[variant=featured]:from-primary data-[variant=featured]:from-0% data-[variant=featured]:to-45% data-[variant=featured]:to-primary/10',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type CardImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

interface ProductCardImageProps {
  image?: CardImage | null;
  alt: string;
  outOfStock?: boolean;
  outOfStockText?: string;
  loading?: 'eager' | 'lazy';
  className?: string;
}

function ProductCardImage({
  image,
  alt,
  outOfStock = false,
  outOfStockText = COPY.outOfStock,
  loading,
  className,
}: ProductCardImageProps) {
  return (
    <div
      data-slot="product-card-image"
      className={cn('relative aspect-square overflow-hidden rounded-ds-md', className)}
    >
      {image ? (
        <Image
          data={image}
          alt={alt}
          loading={loading}
          className="absolute inset-0 size-full object-contain p-1"
          sizes="(min-width: 1024px) 25vw, 50vw"
        />
      ) : (
        <ImagePlaceholder className="size-full" />
      )}
      {outOfStock && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-destructive-foreground font-medium text-ds-small px-2 py-1 bg-destructive rounded">
            {outOfStockText}
          </span>
        </div>
      )}
    </div>
  );
}

/** Color dots under the image. The row keeps its height so titles align across cards. */
function ProductCardSwatches({
  colors = [],
  className,
}: {
  colors?: ProductCardColor[];
  className?: string;
}) {
  const withSwatch = colors.filter((c) => c.color || c.imageUrl);
  const visible = withSwatch.slice(0, MAX_SWATCHES);
  const extra = withSwatch.length - visible.length;
  return (
    <div
      data-slot="product-card-swatches"
      className={cn(
        'flex items-center justify-center gap-1.5 group-data-[variant=minimal]/card:gap-1',
        visible.length > 0 && 'min-h-5',
        className,
      )}
    >
      {visible.map((c) => (
        <span
          key={c.name}
          title={c.name}
          className="size-3.5 rounded-full ring-1 ring-black/15 group-data-[variant=minimal]/card:ring-black/30"
          style={
            c.color
              ? {backgroundColor: c.color}
              : {backgroundImage: `url("${c.imageUrl}")`, backgroundSize: 'cover'}
          }
        />
      ))}
      {extra > 0 && (
        <span className="text-ds-small text-muted-foreground group-data-[variant=minimal]/card:text-foreground">
          +{extra}
        </span>
      )}
    </div>
  );
}

function ProductCardContent({className, children, ...props}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="product-card-content"
      className={cn('flex flex-col flex-1 gap-1 pt-1 pb-1', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ProductCardTitle({className, children, ...props}: ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="product-card-title"
      className={cn('text-ds-regular font-bold text-foreground line-clamp-2 min-h-10', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function ProductCardRating({children}: {children?: ReactNode}) {
  return (
    <div data-slot="product-card-rating" className="text-ds-regular empty:hidden">
      {children}
    </div>
  );
}

/** Renders the currency symbol and cents small and raised. */
function MoneyDisplay({
  amount,
  currencyCode,
  className,
}: {
  amount: string;
  currencyCode: string;
  className?: string;
}) {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).formatToParts(parseFloat(amount));
  return (
    <span className={cn('tabular-nums', className)}>
      {parts.map((part, i) =>
        part.type === 'currency' || part.type === 'decimal' || part.type === 'fraction' ? (
          <span key={i} className="text-[0.6em] align-super">
            {part.value}
          </span>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </span>
  );
}

interface ProductCardPriceProps {
  amount: string;
  currencyCode: string;
  maxAmount?: string;
  compareAtAmount?: string;
  compareAtCurrencyCode?: string;
  className?: string;
}

function ProductCardPrice({
  amount,
  currencyCode,
  maxAmount,
  compareAtAmount,
  compareAtCurrencyCode,
  className,
}: ProductCardPriceProps) {
  const isRange = maxAmount != null && maxAmount !== amount;
  const showCompareAt =
    !isRange && compareAtAmount != null && parseFloat(compareAtAmount) > parseFloat(amount);

  return (
    <div data-slot="product-card-price" className={cn('text-foreground', className)}>
      <div className="text-ds-regular text-muted-foreground">
        {isRange ? (
          COPY.startingAt
        ) : (
          <span className="hidden group-data-[variant=minimal]/card:inline">{COPY.startingAt}</span>
        )}
      </div>
      <MoneyDisplay
        amount={amount}
        currencyCode={currencyCode}
        className="text-ds-medium font-bold"
      />
      {showCompareAt && compareAtAmount && (
        <div className="text-ds-regular text-muted-foreground">
          {COPY.was}{' '}
          <MoneyDisplay
            amount={compareAtAmount}
            currencyCode={compareAtCurrencyCode ?? currencyCode}
            className="line-through [&>span]:!align-baseline [&>span]:!text-[1em]"
          />
        </div>
      )}
    </div>
  );
}

function ProductCardSkeleton({className}: {className?: string}) {
  return (
    <div
      data-slot="product-card-skeleton"
      className={cn('flex flex-col overflow-hidden', className)}
    >
      <ImagePlaceholder className="aspect-square animate-pulse" />
      <div className="py-2.5 grid gap-2">
        <div className="h-4 w-full bg-accent animate-pulse" />
        <div className="h-4 w-2/3 bg-accent animate-pulse" />
        <div className="h-6 w-24 bg-accent animate-pulse" />
      </div>
    </div>
  );
}

export {
  ProductCard,
  ProductCardContent,
  ProductCardImage,
  ProductCardImageContainer,
  ProductCardPrice,
  ProductCardRating,
  ProductCardSkeleton,
  ProductCardSwatches,
  ProductCardTitle,
};
