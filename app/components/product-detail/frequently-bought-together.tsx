import {CartForm, Image} from '@shopify/hydrogen';
import {Fragment} from 'react';

import {useAside} from '~/components/Aside';
import {ImagePlaceholder} from '~/components/ui/image-placeholder';
import LocalizedLink from '~/components/ui/localized-link';
import type {FrequentlyBoughtItem} from '~/lib/product-cross-sell';

const COPY = {
  title: 'Frequently bought together',
  total: 'Total',
  add: 'Add all to cart',
  addBoth: 'Add both to cart',
  adding: 'Adding to cart...',
  chooseOptions: 'Choose options',
};

type Money = {amount: string; currencyCode: string};

export type FrequentlyBoughtMain = {
  imageUrl?: string;
  price: Money;
  subtitle?: string;
  title: string;
  variantId: string;
};

const formatMoney = (money: Money) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: money.currencyCode}).format(
    Number(money.amount),
  );

// Whole units large, cents as a small superscript ($1,999.00 -> $1,999 with raised 00).
function Price({money}: {money: Money}) {
  const parts = new Intl.NumberFormat('en-US', {
    currency: money.currencyCode,
    style: 'currency',
  }).formatToParts(Number(money.amount));
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'decimal') return null;
        if (part.type === 'fraction') {
          return (
            <sup key={i} className="ml-0.5 align-top text-[0.55em] leading-none">
              {part.value}
            </sup>
          );
        }
        return <Fragment key={i}>{part.value}</Fragment>;
      })}
    </>
  );
}

type Card = {
  handle?: string;
  imageAlt?: string;
  imageUrl?: string;
  needsChoice: boolean;
  price: Money;
  subtitle?: string;
  title: string;
  variantId: string;
};

export function FrequentlyBoughtTogether({
  items,
  main,
}: {
  items: FrequentlyBoughtItem[];
  main: FrequentlyBoughtMain;
}) {
  const {open} = useAside();

  const cards: Card[] = [
    {
      imageUrl: main.imageUrl,
      needsChoice: false,
      price: main.price,
      subtitle: main.subtitle,
      title: main.title,
      variantId: main.variantId,
    },
    ...items.map((item) => ({
      handle: item.handle,
      imageAlt: item.imageAlt,
      imageUrl: item.imageUrl,
      needsChoice: item.hasMultipleVariants,
      price: item.price,
      title: item.title,
      variantId: item.variantId,
    })),
  ];

  // Products with several variants link to their page instead of being added from here.
  const included = cards.filter((card) => !card.needsChoice);
  const total = included.reduce((sum, card) => sum + Number(card.price.amount), 0);
  const totalMoney = {amount: total.toFixed(2), currencyCode: main.price.currencyCode};

  return (
    <section className="grid gap-4" data-slot="frequently-bought-together">
      <h2 className="text-ds-h4 font-semibold">{COPY.title}</h2>
      <div className="flex flex-col gap-8 rounded-ds-lg border border-border-subtle bg-card p-6 shadow-ds-drop-sm lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-6 lg:flex-1">
          {cards.map((card, index) => (
            <Fragment key={card.variantId}>
              {index > 0 ? (
                <span aria-hidden className="mt-20 text-ds-h4 text-foreground">
                  +
                </span>
              ) : null}
              <div className="grid w-44 content-start justify-items-center gap-2 text-center sm:w-52">
                <div className="relative size-36 sm:size-44">
                  {card.imageUrl ? (
                    <Image
                      data={{url: card.imageUrl, altText: card.imageAlt ?? card.title}}
                      alt={card.imageAlt ?? card.title}
                      sizes="176px"
                      className="absolute inset-0 size-full object-contain"
                    />
                  ) : (
                    <ImagePlaceholder className="size-full bg-muted" />
                  )}
                </div>
                {card.handle ? (
                  <LocalizedLink
                    className="line-clamp-2 text-ds-regular font-semibold transition-opacity hover:opacity-70"
                    href={`/products/${card.handle}`}
                  >
                    {card.title}
                  </LocalizedLink>
                ) : (
                  <p className="line-clamp-2 text-ds-regular font-semibold">{card.title}</p>
                )}
                {card.subtitle ? (
                  <p className="line-clamp-2 text-ds-small text-muted-foreground">
                    {card.subtitle}
                  </p>
                ) : null}
                {card.needsChoice && card.handle ? (
                  <LocalizedLink
                    className="text-ds-regular text-muted-foreground underline"
                    href={`/products/${card.handle}`}
                  >
                    {COPY.chooseOptions}
                  </LocalizedLink>
                ) : (
                  <p className="text-ds-h4 font-semibold tabular-nums">
                    <Price money={card.price} />
                  </p>
                )}
              </div>
            </Fragment>
          ))}
        </div>

        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={{lines: included.map((card) => ({merchandiseId: card.variantId, quantity: 1}))}}
        >
          {(fetcher) => {
            const pending = fetcher.state !== 'idle';
            return (
              <div className="grid justify-items-center gap-3 text-center lg:min-w-56">
                <p className="text-ds-regular font-semibold">
                  {COPY.total}: <span className="tabular-nums">{formatMoney(totalMoney)}</span>
                </p>
                <button
                  type="submit"
                  disabled={pending || included.length < 2}
                  onClick={() => open('cart')}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-ds-md bg-black px-6 text-ds-regular font-semibold text-white hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? COPY.adding : included.length === 2 ? COPY.addBoth : COPY.add}
                </button>
              </div>
            );
          }}
        </CartForm>
      </div>
    </section>
  );
}
