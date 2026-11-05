import {Money, type OptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {COPY} from './copy';
import {useCartPending} from './use-cart-pending';

export function CartTotal({cart}: {cart: OptimisticCart<CartApiQueryFragment | null> | null}) {
  const isPending = useCartPending();
  const total = cart?.cost?.totalAmount;
  return (
    <div aria-busy={isPending || undefined} aria-label={COPY.total} className="grid gap-1" role="group">
      <div className="flex items-baseline justify-between text-ds-regular text-foreground">
        <span>{COPY.total}</span>
        {isPending || !total?.currencyCode ? (
          <span className="font-medium text-ds-medium text-muted-foreground">{COPY.updating}</span>
        ) : (
          <Money as="span" data={total} className="font-medium text-ds-medium" />
        )}
      </div>
      <p className="text-ds-small text-muted-foreground">{COPY.totalNote}</p>
    </div>
  );
}
