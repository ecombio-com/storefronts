import type {OptimisticCart} from '@shopify/hydrogen';
import {LockIcon} from 'lucide-react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {PaymentIcons} from '~/components/footer/payment-icons';
import {CartCheckout} from './checkout';
import {DiscountForm} from './discount-form';
import {CartTotal} from './total';

export function CartPageSummary({
  cart,
}: {
  cart: OptimisticCart<CartApiQueryFragment | null> | null;
}) {
  const hasLines = (cart?.lines?.nodes?.length ?? 0) > 0;
  if (!hasLines) return null;
  return (
    <section
      aria-labelledby="cart-summary-heading"
      className="grid gap-5 rounded-ds-lg border border-border bg-background p-5 shadow-ds-drop-xs"
    >
      <h2 id="cart-summary-heading" className="text-ds-medium font-medium text-foreground">
        Summary
      </h2>
      <DiscountForm discountCodes={cart?.discountCodes ?? []} />
      <div className="border-t border-border pt-5">
        <CartTotal cart={cart} />
      </div>
      <CartCheckout checkoutUrl={cart?.checkoutUrl} hasLines={hasLines} />
      <div className="grid justify-items-center gap-2.5 rounded-ds-md border border-border p-2.5">
        <PaymentIcons />
        <p className="flex items-center gap-1.5 text-ds-small text-muted-foreground">
          <LockIcon className="size-3.5" aria-hidden="true" />
          Secure payment
        </p>
      </div>
    </section>
  );
}