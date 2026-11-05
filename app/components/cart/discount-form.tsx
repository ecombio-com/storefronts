import {CartForm} from '@shopify/hydrogen';
import {cn} from 'cn';
import {Loader2, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useFetcher} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {COPY} from './copy';
import type {CartActionData} from './warnings';

const FETCHER_KEY = 'cart-discount';

export function DiscountForm({
  discountCodes,
}: {
  discountCodes: CartApiQueryFragment['discountCodes'];
}) {
  const fetcher = useFetcher<CartActionData>({key: FETCHER_KEY});
  const [code, setCode] = useState('');
  const isPending = fetcher.state !== 'idle';
  const normalized = code.trim().toUpperCase();
  const applied = discountCodes.map((discount) => discount.code);
  const isDuplicate = applied.some((existing) => existing.toUpperCase() === normalized);
  const error =
    [...(fetcher.data?.errors ?? []), ...(fetcher.data?.warnings ?? [])][0]?.message ?? null;

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) setCode('');
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="grid gap-2.5">
      <CartForm
        fetcherKey={FETCHER_KEY}
        route="/cart"
        action={CartForm.ACTIONS.DiscountCodesUpdate}
        inputs={{discountCodes: applied}}
      >
        <div className="flex gap-2.5">
          <input type="hidden" name="discountCode" value={normalized} />
          <Input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={COPY.discountPlaceholder}
            aria-label={COPY.discountPlaceholder}
            aria-invalid={error ? true : undefined}
            disabled={isPending}
            autoComplete="off"
            spellCheck={false}
            className="flex-1"
          />
          <Button type="submit" disabled={isPending || !normalized || isDuplicate}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              COPY.discountApply
            )}
          </Button>
        </div>
      </CartForm>

      {error ? (
        <p role="alert" className="text-ds-small text-destructive">
          {error}
        </p>
      ) : null}

      {discountCodes.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label={COPY.discountList}>
          {discountCodes.map((discount) => (
            <li key={discount.code}>
              <CartForm
                fetcherKey={FETCHER_KEY}
                route="/cart"
                action={CartForm.ACTIONS.DiscountCodesUpdate}
                inputs={{discountCodes: applied.filter((existing) => existing !== discount.code)}}
              >
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-ds-small',
                    discount.applicable
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-input bg-muted text-muted-foreground',
                  )}
                >
                  <span className={cn(!discount.applicable && 'line-through')}>
                    {discount.code}
                  </span>
                  {!discount.applicable ? (
                    <span className="text-ds-small uppercase tracking-wide">
                      {COPY.notApplicable}
                    </span>
                  ) : null}
                  <button
                    type="submit"
                    aria-label={COPY.discountRemove(discount.code)}
                    disabled={isPending}
                    className={cn(
                      'ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-ds-sm disabled:cursor-not-allowed',
                      discount.applicable
                        ? 'hover:bg-primary-foreground/15'
                        : 'hover:bg-foreground/10',
                    )}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              </CartForm>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
