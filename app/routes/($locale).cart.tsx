import {CartForm, useOptimisticCart, type CartQueryDataReturn} from '@shopify/hydrogen';
import {cn} from 'cn';
import {data, useLoaderData, type HeadersFunction} from 'react-router';
import type {Route} from './+types/($locale).cart';
import {CartPageLine} from '~/components/cart/cart-page-line';
import {CartPageSummary} from '~/components/cart/cart-page-summary';
import {COPY} from '~/components/cart/copy';
import {buttonVariants} from '~/components/ui/button';
import {Container} from '~/components/ui/container';
import LocalizedLink from '~/components/ui/localized-link';
import {Page} from '~/components/ui/page';

export const meta: Route.MetaFunction = () => [
  {title: 'Cart'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const original = useLoaderData<typeof loader>();
  // Applies pending cart actions so the page updates before the server responds.
  const cart = useOptimisticCart(original);
  const lines = cart?.lines?.nodes ?? [];
  const count = cart?.totalQuantity ?? 0;

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 px-5 py-10">
        <h1 className="text-2xl sm:text-3xl">{COPY.empty}</h1>
        <LocalizedLink href="/" className={cn(buttonVariants(), 'h-12 px-8')}>
          {COPY.continueShopping}
        </LocalizedLink>
      </div>
    );
  }

  return (
    <Page className="bg-muted pb-10">
      <Container>
        <div className="grid gap-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl">Your cart</h1>
            <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-ds-regular text-background">
              {count}
            </span>
          </div>
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8 xl:col-span-9">
              <ul className="grid gap-5" aria-label={COPY.items}>
                {lines.map((line) => (
                  <CartPageLine key={line.id} line={line} />
                ))}
              </ul>
            </div>
            <aside className="lg:col-span-4 xl:col-span-3" aria-label="Order summary">
              <div className="lg:sticky lg:top-20">
                <CartPageSummary cart={cart} />
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </Page>
  );
}