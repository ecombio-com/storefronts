import {CartForm, Image, Money} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {MinusIcon, PlusIcon, Trash2Icon} from 'lucide-react';
import type {ReactNode} from 'react';
import {useFetcher} from 'react-router';
import {useAside} from '~/components/Aside';
import type {CartLine} from '~/components/CartLineItem';
import LocalizedLink from '~/components/ui/localized-link';
import {COPY} from './copy';
import {useCartPending} from './use-cart-pending';
import {CartWarnings, type CartActionData} from './warnings';

const MAX_QUANTITY = 99;
const STEP_BUTTON =
  'flex h-6 w-full cursor-pointer items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-50';

export function CartDrawerItem({line}: {line: CartLine}) {
  const {close} = useAside();
  // Shared key: rapid +/- clicks on one line cancel each other instead of racing.
  const fetcherKey = [CartForm.ACTIONS.LinesUpdate, line.id].join('-');
  const fetcher = useFetcher<CartActionData>({key: fetcherKey});
  const isCostPending = useCartPending();
  const {cost, merchandise, quantity} = line;
  const isOptimistic = Boolean(line.isOptimistic);
  const currencyCode = cost?.totalAmount?.currencyCode;
  const finalUnit = quantity > 0 ? Number(cost?.totalAmount?.amount ?? 0) / quantity : 0;
  const sellingUnit = Number(cost?.amountPerQuantity?.amount ?? 0);
  const compareAtUnit = Number(cost?.compareAtAmountPerQuantity?.amount ?? 0);
  const originalUnit = finalUnit < sellingUnit ? sellingUnit : compareAtUnit;
  const title = merchandise?.product?.title || COPY.item;
  const href = merchandise?.product?.handle
    ? `/products/${merchandise.product.handle}`
    : undefined;
  const image = merchandise?.image;
  const components = 'lineComponents' in line ? (line.lineComponents ?? []) : [];
  const showPending = isCostPending || !currencyCode;
  const options = (merchandise?.selectedOptions ?? [])
    .map((option) => option.value)
    .filter((value) => value !== 'Default Title')
    .join(' / ');

  const imageContent = image?.url ? (
    <Image
      data={image}
      alt={image.altText || title}
      sizes="72px"
      className="size-full object-cover"
    />
  ) : (
    <div className="size-full bg-muted" />
  );

  return (
    <li
      className="flex gap-2.5"
      aria-busy={fetcher.state !== 'idle' || undefined}
      aria-label={title}
    >
      {href ? (
        <LocalizedLink
          href={href}
          onClick={close}
          className="relative size-18 shrink-0 cursor-pointer self-start overflow-hidden transition-opacity hover:opacity-80"
        >
          {imageContent}
        </LocalizedLink>
      ) : (
        <div className="relative size-18 shrink-0 self-start overflow-hidden">
          {imageContent}
        </div>
      )}

      <div className="grid min-h-18 min-w-0 flex-1 gap-2.5 pt-0.5">
        <div className="grid gap-2.5">
          <div className="grid gap-1">
            {href ? (
              <LocalizedLink
                href={href}
                onClick={close}
                className="cursor-pointer transition-opacity hover:opacity-70"
              >
                <h3 className="line-clamp-1 text-ds-regular font-medium text-foreground">
                  {title}
                </h3>
              </LocalizedLink>
            ) : (
              <h3 className="line-clamp-1 text-ds-regular font-medium text-foreground">
                {title}
              </h3>
            )}
            {options ? (
              <p className="text-ds-small text-muted-foreground">
                {options}
              </p>
            ) : null}
          </div>
          {components.length ? (
            <div className="grid gap-1">
              <p className="text-ds-small font-medium text-muted-foreground">{COPY.bundle}</p>
              <ul className="grid gap-0.5">
                {components.map((component) => (
                  <li
                    key={component.id}
                    className="flex items-center gap-1.5 text-ds-small text-muted-foreground"
                  >
                    <span className="truncate">
                      {component.merchandise?.product?.title || COPY.bundleItem}
                    </span>
                    {component.quantity > 1 ? <span>x{component.quantity}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 self-end">
          <div
            role="group"
            aria-label={COPY.quantity}
            className="grid h-6 grid-cols-[1.75rem_1.5rem_1.75rem] rounded-full ring-1 ring-border ring-inset [&>form]:contents"
          >
            <UpdateForm fetcherKey={fetcherKey} lines={[{id: line.id, quantity: quantity - 1}]}>
              <button
                type="submit"
                aria-label={COPY.decrease}
                className={STEP_BUTTON}
                disabled={isOptimistic || quantity <= 1}
              >
                <MinusIcon className="size-3 shrink-0" />
              </button>
            </UpdateForm>
            <span
              aria-live="polite"
              className="flex h-6 w-6 items-center justify-center text-ds-small font-medium tabular-nums"
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
                <PlusIcon className="size-3 shrink-0" />
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
              aria-label={COPY.remove}
              disabled={isOptimistic}
              className="flex cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2Icon className="size-4" />
            </button>
          </CartForm>
        </div>
        <CartWarnings data={fetcher.data} />
      </div>

      <div className="grid gap-0.5 self-start py-0.5 text-right font-mono text-ds-regular tabular-nums tracking-tight">
        <span
          className="font-medium text-foreground data-[pending=true]:text-muted-foreground"
          data-pending={showPending}
        >
          {showPending || !currencyCode ? (
            COPY.updating
          ) : (
            <Money as="span" data={{amount: String(finalUnit), currencyCode}} />
          )}
        </span>
        {!showPending && currencyCode && originalUnit > finalUnit ? (
          <span className="text-ds-small text-muted-foreground line-through">
            <Money as="span" data={{amount: String(originalUnit), currencyCode}} />
          </span>
        ) : null}
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

