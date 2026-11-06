import {CartForm, Image, Money} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {MinusIcon, PlusIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {useFetcher} from 'react-router';
import type {CartLine} from '~/components/CartLineItem';
import LocalizedLink from '~/components/ui/localized-link';
import {COPY} from './copy';
import {useCartPending} from './use-cart-pending';
import {CartWarnings, type CartActionData} from './warnings';

const MAX_QUANTITY = 99;
const STEP_BUTTON =
  'flex h-9 cursor-pointer items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-50';

export function CartPageLine({line}: {line: CartLine}) {
  // Shared key: rapid +/- clicks on one line cancel each other instead of racing.
  const fetcherKey = [CartForm.ACTIONS.LinesUpdate, line.id].join('-');
  const fetcher = useFetcher<CartActionData>({key: fetcherKey});
  const isCostPending = useCartPending();
  const {cost, merchandise, quantity} = line;
  const isOptimistic = Boolean(line.isOptimistic);
  const currencyCode = cost?.totalAmount?.currencyCode;
  const lineTotal = Number(cost?.totalAmount?.amount ?? 0);
  const finalUnit = quantity > 0 ? lineTotal / quantity : 0;
  const sellingUnit = Number(cost?.amountPerQuantity?.amount ?? 0);
  const compareAtUnit = Number(cost?.compareAtAmountPerQuantity?.amount ?? 0);
  const originalUnit = finalUnit < sellingUnit ? sellingUnit : compareAtUnit;
  const savingsPercent =
    originalUnit > finalUnit ? Math.round((1 - finalUnit / originalUnit) * 100) : 0;
  const title = merchandise?.product?.title || COPY.item;
  const href = merchandise?.product?.handle ? `/products/${merchandise.product.handle}` : undefined;
  const image = merchandise?.image;
  const components = 'lineComponents' in line ? (line.lineComponents ?? []) : [];
  const showPrice = !isCostPending && Boolean(currencyCode);
  const options = (merchandise?.selectedOptions ?? []).filter((o) => o.value !== 'Default Title');
  const imageClassName =
    'relative size-24 shrink-0 self-start overflow-hidden rounded-ds-md sm:size-28';
  const imageContent = image?.url ? (
    <Image data={image} alt={image.altText || title} sizes="112px" className="size-full object-cover" />
  ) : (
    <div className="size-full bg-muted" />
  );

  return (
    <li
      aria-busy={fetcher.state !== 'idle' || undefined}
      aria-label={title}
      className="grid grid-cols-[auto_1fr] gap-5 rounded-ds-lg border border-border bg-background p-5 shadow-ds-drop-xs sm:grid-cols-[auto_1fr_auto]"
    >
      {href ? (
        <LocalizedLink href={href} className={`${imageClassName} cursor-pointer transition-opacity hover:opacity-80`}>
          {imageContent}
        </LocalizedLink>
      ) : (
        <div className={imageClassName}>{imageContent}</div>
      )}

      <div className="grid min-w-0 content-start gap-2.5">
        {href ? (
          <LocalizedLink href={href} className="cursor-pointer transition-opacity hover:opacity-70">
            <h2 className="line-clamp-2 text-ds-medium font-medium text-foreground">{title}</h2>
          </LocalizedLink>
        ) : (
          <h2 className="line-clamp-2 text-ds-medium font-medium text-foreground">{title}</h2>
        )}
        {options.length ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Selected options">
            {options.map((option) => (
              <li
                key={`${option.name}:${option.value}`}
                className="rounded-ds-sm border border-border px-1.5 py-0.5 text-ds-small text-muted-foreground"
              >
                {option.value}
              </li>
            ))}
          </ul>
        ) : null}
        {components.length ? (
          <div className="grid gap-1">
            <p className="text-ds-small font-medium text-muted-foreground">{COPY.bundle}</p>
            <ul className="grid gap-0.5">
              {components.map((component) => (
                <li key={component.id} className="flex items-center gap-1.5 text-ds-small text-muted-foreground">
                  <span className="truncate">{component.merchandise?.product?.title || COPY.bundleItem}</span>
                  {component.quantity > 1 ? <span>x{component.quantity}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="col-span-2 grid content-start gap-2.5 sm:col-span-1 sm:justify-items-end sm:text-right">
        <div className="grid gap-1 font-mono tabular-nums tracking-tight sm:justify-items-end">
          <span
            className="text-ds-medium font-medium text-foreground data-[pending=true]:text-muted-foreground"
            data-pending={!showPrice}
          >
            {showPrice && currencyCode ? (
              <Money as="span" data={{amount: String(lineTotal), currencyCode}} />
            ) : (
              COPY.updating
            )}
          </span>
          {showPrice && currencyCode && savingsPercent > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-positive/15 px-2 py-0.5 font-mono text-ds-small font-medium tabular-nums text-positive">
                {savingsPercent}% OFF
              </span>
              <span className="text-ds-small text-muted-foreground line-through">
                <Money as="span" data={{amount: String(originalUnit * quantity), currencyCode}} />
              </span>
            </span>
          ) : null}
          {showPrice && currencyCode && quantity > 1 ? (
            <span className="text-ds-small text-muted-foreground">
              <Money as="span" data={{amount: String(finalUnit), currencyCode}} /> each
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2.5">
          <div
            role="group"
            aria-label={COPY.quantity}
            className="grid h-9 grid-cols-[2.25rem_2.5rem_2.25rem] rounded-full ring-1 ring-border ring-inset [&>form]:contents"
          >
            <UpdateForm fetcherKey={fetcherKey} lines={[{id: line.id, quantity: quantity - 1}]}>
              <button
                type="submit"
                aria-label={COPY.decrease}
                className={STEP_BUTTON}
                disabled={isOptimistic || quantity <= 1}
              >
                <MinusIcon className="size-3.5 shrink-0" />
              </button>
            </UpdateForm>
            <span
              aria-live="polite"
              className="flex h-9 items-center justify-center text-ds-regular font-medium tabular-nums"
            >
              {quantity}
            </span>
            <UpdateForm fetcherKey={fetcherKey} lines={[{id: line.id, quantity: quantity + 1}]}>
              <button
                type="submit"
                aria-label={COPY.increase}
                className={STEP_BUTTON}
                disabled={isOptimistic || quantity >= MAX_QUANTITY}
              >
                <PlusIcon className="size-3.5 shrink-0" />
              </button>
            </UpdateForm>
          </div>
          <CartForm
            fetcherKey={fetcherKey}
            route="/cart"
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{lineIds: [line.id]}}
          >
            <button
              type="submit"
              aria-label={`${COPY.remove} ${title}`}
              disabled={isOptimistic}
              className="inline-flex h-9 cursor-pointer items-center rounded-ds-md border border-border px-3 text-ds-small font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </CartForm>
        </div>
      </div>

      <div className="col-span-2 empty:hidden sm:col-span-3">
        <CartWarnings data={fetcher.data} />
      </div>
    </li>
  );
}

function UpdateForm({
  children,
  fetcherKey,
  lines,
}: {
  children: ReactNode;
  fetcherKey: string;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}