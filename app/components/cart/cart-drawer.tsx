import {useOptimisticCart, type OptimisticCart} from '@shopify/hydrogen';
import {cn} from 'cn';
import {Loader2, XIcon} from 'lucide-react';
import {Suspense} from 'react';
import {Await} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {buttonVariants} from '~/components/ui/button';
import LocalizedLink from '~/components/ui/localized-link';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '~/components/ui/sheet';
import {CartDrawerItem} from './cart-drawer-item';
import {CartCheckout} from './checkout';
import {COPY} from './copy';
import {DiscountForm} from './discount-form';
import {CartTotal} from './total';

export function CartDrawer({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const {type, close} = useAside();
  return (
    <Sheet modal={false}
      open={type === 'cart'}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent closeButton={false} overlay={false} side="right" className="gap-0 p-0">
        <Suspense
          fallback={
            <>
              <DrawerHeader count={0} />
              <div className="flex h-full items-center justify-center gap-2.5" role="status">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {COPY.loading}
              </div>
            </>
          }
        >
          <Await resolve={cart} errorElement={<ResolvedCart cart={null} />}>
            {(resolved) => <ResolvedCart cart={resolved} />}
          </Await>
        </Suspense>
      </SheetContent>
    </Sheet>
  );
}

function ResolvedCart({cart: original}: {cart: CartApiQueryFragment | null}) {
  const cart = useOptimisticCart(original);
  return (
    <>
      <DrawerHeader count={cart?.totalQuantity ?? 0} />
      <DrawerBody cart={cart} />
    </>
  );
}

function DrawerHeader({count}: {count: number}) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-2.5">
        <div className="flex items-center gap-1.5">
          <SheetTitle className="font-normal text-ds-medium leading-4">{COPY.title}</SheetTitle>
          {count > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-ds-small text-background">
              {count}
            </span>
          ) : null}
        </div>
        <SheetClose
          aria-label={COPY.close}
          className="flex cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <XIcon className="size-5" />
        </SheetClose>
      </div>
      <SheetDescription className="sr-only">{COPY.description}</SheetDescription>
    </>
  );
}

function DrawerBody({cart}: {cart: OptimisticCart<CartApiQueryFragment | null> | null}) {
  const {close} = useAside();
  const lines = cart?.lines?.nodes ?? [];

  if (!lines.length) {
    return (
      <div className="flex h-full flex-col gap-5 px-2.5">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h3 className="mb-6 text-2xl">{COPY.empty}</h3>
          <LocalizedLink href="/" onClick={close} className={cn(buttonVariants(), 'h-12 px-8')}>
            {COPY.continueShopping}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-2.5 py-5">
        <ul className="space-y-5" aria-label={COPY.items}>
          {lines.map((line) => (
            <CartDrawerItem key={line.id} line={line} />
          ))}
        </ul>
      </div>
      <footer className="space-y-5 px-2.5 pt-5 pb-2.5">
        <div className="grid gap-2.5">
          <DiscountForm discountCodes={cart?.discountCodes ?? []} />
          <CartTotal cart={cart} />
        </div>
        <CartCheckout checkoutUrl={cart?.checkoutUrl} hasLines={lines.length > 0} />
      </footer>
    </div>
  );
}

