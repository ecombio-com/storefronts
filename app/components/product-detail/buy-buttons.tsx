import {CartForm} from '@shopify/hydrogen';
import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import {cn} from 'cn';
import {Loader2, MinusIcon, PlusIcon} from 'lucide-react';
import {useEffect, useId, useState} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {formatPrice} from '~/lib/format';
import {BuyWithShopLogo} from './buy-with-shop-logo';

type Variant = NonNullable<ProductFragment['selectedOrFirstAvailableVariant']>;
type Money = {amount: string; currencyCode: string};
type Plan = {
  price: Money;
  sellingPlan: {
    id: string;
    name: string;
    description?: string | null;
    recurringDeliveries: boolean;
  };
};

export function getPurchaseOptions(variant: Variant | null | undefined, purchaseOption = '') {
  const plans: Plan[] = variant
    ? variant.sellingPlanAllocations.nodes
        .filter((a) => a.sellingPlan.recurringDeliveries)
        .map((a) => ({
          price: a.priceAdjustments[0]?.price ?? variant.price,
          sellingPlan: a.sellingPlan,
        }))
    : [];
  const selectedPlan =
    plans.find((p) => p.sellingPlan.id === purchaseOption) ??
    (variant?.product.requiresSellingPlan ? plans[0] : undefined);
  return {plans, selectedPlan};
}

function shopPayUrl(
  domain: string | undefined,
  id: string,
  quantity: number,
  disabled: boolean,
): string | undefined {
  if (disabled || !domain) return undefined;
  const numeric = id.split('/').pop();
  return numeric ? `https://${domain}/cart/${numeric}:${quantity}?payment=shop_pay` : undefined;
}

export function BuyButtons({
  selectedVariant,
  availableForSale = true,
  buyWithShop = true,
  quantityPicker = true,
}: {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  availableForSale?: boolean;
  buyWithShop?: boolean;
  quantityPicker?: boolean;
}) {
  const {open} = useAside();
  const root = useRouteLoaderData<RootLoader>('root');
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchaseOption, setPurchaseOption] = useState('');
  const {plans, selectedPlan} = getPurchaseOptions(selectedVariant, purchaseOption);

  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setIsBuyingNow(false);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  if (!selectedVariant) return null;
  const requiresPlan = selectedVariant.product.requiresSellingPlan;
  const missingRequiredPlan = Boolean(requiresPlan && !selectedPlan);
  const isOutOfStock = !selectedVariant.availableForSale;
  const buyNowUrl = shopPayUrl(root?.publicStoreDomain, selectedVariant.id, quantity, isOutOfStock);

  return (
    <div className="grid gap-2.5">
      <PurchaseOptions
        onSelect={setPurchaseOption}
        plans={plans}
        price={selectedVariant.price}
        requiresSellingPlan={requiresPlan}
        selectedPlan={selectedPlan}
      />
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesAdd}
        inputs={{
          lines: [
            {
              merchandiseId: selectedVariant.id,
              quantity,
              sellingPlanId: selectedPlan?.sellingPlan.id,
              selectedVariant,
            },
          ],
        }}
      >
        {(fetcher) => {
          const pending = fetcher.state !== 'idle';
          const disabled = isOutOfStock || missingRequiredPlan || pending;
          const text = pending
            ? 'Adding to Cart...'
            : missingRequiredPlan
              ? 'Subscription unavailable'
              : isOutOfStock
                ? 'Out of Stock'
                : 'Add to Cart';
          return (
            <div className="flex gap-2.5">
              {quantityPicker ? (
                <div
                  aria-label="Item quantity"
                  className="grid h-12 w-32 shrink-0 grid-cols-[3rem_2rem_3rem] rounded-ds-md bg-card ring-1 ring-border ring-inset"
                  role="group"
                >
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className="flex size-12 cursor-pointer items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={quantity === 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <MinusIcon className="size-4 shrink-0" />
                  </button>
                  <span
                    aria-live="polite"
                    className="flex h-12 w-8 items-center justify-center text-ds-regular font-medium tabular-nums"
                    role="status"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className="flex size-12 cursor-pointer items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={quantity === 99}
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  >
                    <PlusIcon className="size-4 shrink-0" />
                  </button>
                </div>
              ) : null}
              <button
                type="submit"
                disabled={disabled}
                onClick={() => open('cart')}
                className="inline-flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-ds-md bg-black text-ds-regular font-semibold text-white hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {text}
              </button>
            </div>
          );
        }}
      </CartForm>
      {buyWithShop && !selectedPlan && !requiresPlan ? (
        <a
          aria-busy={isBuyingNow || undefined}
          aria-disabled={buyNowUrl ? undefined : true}
          className={cn(
            'flex h-12 w-full cursor-pointer items-center justify-center rounded-ds-md bg-shop px-4 text-white transition-colors hover:bg-shop/85 aria-busy:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
            !availableForSale && 'invisible',
          )}
          href={buyNowUrl}
          onClick={(event) => {
            if (!buyNowUrl || isBuyingNow) {
              event.preventDefault();
              return;
            }
            setIsBuyingNow(true);
          }}
          rel="nofollow"
        >
          {isBuyingNow ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <span className="sr-only">Buy with</span>
              <BuyWithShopLogo aria-hidden="true" className="h-auto w-24.5" />
            </>
          )}
        </a>
      ) : null}
    </div>
  );
}

export function PurchaseOptions({
  disabled = false,
  onSelect,
  plans,
  price,
  requiresSellingPlan,
  selectedPlan,
}: {
  disabled?: boolean;
  onSelect?: (id: string) => void;
  plans: Plan[];
  price: Money;
  requiresSellingPlan: boolean;
  selectedPlan: Plan | undefined;
}) {
  const purchaseOptionId = useId();
  if (plans.length === 0) return null;
  const rows = [
    ...(!requiresSellingPlan ? [{id: '', name: 'One-time purchase', price}] : []),
    ...plans.map((p) => ({id: p.sellingPlan.id, name: p.sellingPlan.name, price: p.price})),
  ];
  return (
    <fieldset className="grid gap-2.5" disabled={disabled}>
      <legend className="pb-2.5 text-ds-regular font-medium">Purchase options</legend>
      {rows.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer items-center gap-2.5 rounded-ds-md border border-border p-4 has-checked:border-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50"
        >
          <input
            type="radio"
            name={purchaseOptionId}
            value={option.id}
            checked={(selectedPlan?.sellingPlan.id ?? '') === option.id}
            onChange={onSelect ? () => onSelect(option.id) : undefined}
            readOnly={!onSelect}
            className="size-4 cursor-pointer accent-foreground disabled:cursor-not-allowed"
          />
          <span className="flex flex-1 flex-wrap items-center justify-between gap-2.5 text-ds-regular">
            <span>{option.name}</span>
            <span className="tabular-nums">
              {formatPrice(option.price.amount, option.price.currencyCode)}
            </span>
          </span>
        </label>
      ))}
      {selectedPlan ? (
        <p className="text-ds-regular text-muted-foreground">
          Recurring purchase.{' '}
          {selectedPlan.sellingPlan.description || 'Subscription details are shown at checkout.'}
        </p>
      ) : null}
    </fieldset>
  );
}