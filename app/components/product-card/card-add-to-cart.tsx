import {CartForm} from '@shopify/hydrogen';
import {Check} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useRouteLoaderData} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import type {RootLoader} from '~/root';
import type {ProductCardData} from './types';

const COPY = {
  viewProduct: 'View product',
  add: 'Add to cart',
  added: 'Added to cart',
};

const base =
  'mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-ds-md border py-2 text-ds-regular font-medium transition-colors';
const idle = `${base} border-foreground bg-card text-foreground hover:bg-[#e2e5eb]`;
const done = `${base} border-positive bg-positive/10 text-positive`;

type RootCart = Promise<CartApiQueryFragment | null> | CartApiQueryFragment | null | undefined;

// Variant and product ids currently in the cart, resolved from the root loader's cart promise.
function useCartIds() {
  const root = useRouteLoaderData<RootLoader>('root');
  const cart = (root as unknown as {cart?: RootCart} | undefined)?.cart;
  const [ids, setIds] = useState<{variants: Set<string>; products: Set<string>}>(() => ({
    variants: new Set(),
    products: new Set(),
  }));
  useEffect(() => {
    let live = true;
    Promise.resolve(cart)
      .then((c) => {
        if (!live) return;
        const lines = c?.lines?.nodes ?? [];
        setIds({
          variants: new Set(lines.map((l) => l.merchandise.id)),
          products: new Set(
            lines.map((l) => l.merchandise.product?.id).filter((id): id is string => Boolean(id)),
          ),
        });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [cart]);
  return ids;
}

export function CardAddToCart({
  hidden,
  product,
}: {
  hidden?: boolean;
  product: ProductCardData;
}) {
  const {open} = useAside();
  const cartIds = useCartIds();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(id);
  }, [added]);

  if (hidden) return null;

  const variantId = product.defaultVariantId;
  if (!variantId || !product.availableForSale) {
    return <div className={idle}>{COPY.viewProduct}</div>;
  }

  // Same rule as Next.js: the card counts as "in cart" if its variant or its product is in the cart.
  const inCart = cartIds.variants.has(variantId) || cartIds.products.has(product.id);
  const showDone = inCart || added;

  // The form stays mounted in every state so an in-flight add is never aborted.
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesAdd}
        inputs={{lines: [{merchandiseId: variantId, quantity: 1}]}}
      >
        {showDone ? (
          <button
            type="button"
            className={done}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              open('cart');
            }}
          >
            <Check className="size-4" aria-hidden="true" /> {COPY.added}
          </button>
        ) : (
          <button
            type="submit"
            className={idle}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAdded(true);
              open('cart');
              e.currentTarget.form?.requestSubmit(e.currentTarget);
            }}
          >
            <span aria-hidden="true">+</span> {COPY.add}
          </button>
        )}
      </CartForm>
    </div>
  );
}
