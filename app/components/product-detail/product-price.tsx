import {cn} from 'cn';
import type {ComponentProps} from 'react';
import {formatPrice} from '~/lib/format';

const PRICE = 'font-mono text-ds-medium text-foreground tabular-nums tracking-tight';

export function ProductPrice({
  amount,
  currencyCode,
  compareAtAmount,
  className,
  ...props
}: {
  amount: string;
  currencyCode: string;
  compareAtAmount?: string | null | undefined;
} & ComponentProps<'div'>) {
  const price = Number(amount);
  const compareAt = Number(compareAtAmount);
  const onSale = Boolean(compareAtAmount) && compareAt > price;
  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-ds-small gap-y-ds-xsmall', className)}
      {...props}
    >
      <span className={cn(PRICE, 'text-ds-medium font-semibold')}>
        {formatPrice(amount, currencyCode)}
      </span>
      {onSale && compareAtAmount ? (
        <>
          <span className={cn(PRICE, 'text-ds-regular line-through text-foreground/60')}>
            {formatPrice(compareAtAmount, currencyCode)}
          </span>
          <span className="inline-flex items-center rounded-full bg-positive/15 px-2 py-0.5 font-mono text-ds-small font-medium tabular-nums text-positive">
            Save {formatPrice(String(compareAt - price), currencyCode)}
          </span>
        </>
      ) : null}
    </div>
  );
}