import {Image, Money} from '@shopify/hydrogen';
import {cn} from 'cn';
import {ArrowLeft} from 'lucide-react';
import {redirect, useLoaderData} from 'react-router';
import type {OrderLineItemFullFragment, OrderQuery} from 'customer-accountapi.generated';
import type {Route} from './+types/($locale).account.orders.$id';
import {AccountCard} from '~/components/account/account-card';
import {
  formatOrderDate,
  OrderStatusPill,
} from '~/components/account/order-display';
import {AccountPageHeader} from '~/components/account/page-header';
import {buttonVariants} from '~/components/ui/button';
import LocalizedLink from '~/components/ui/localized-link';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  await customerAccount.handleAuthStatus();
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage, fulfillmentStatus} =
    useLoaderData<typeof loader>();
  const shippingLines = order.shippingAddress?.formatted ?? [];
  const hasDiscount = Boolean(discountPercentage || discountValue?.amount);

  return (
    <>
      <AccountPageHeader
        title={order.name}
        description={order.processedAt ? formatOrderDate(order.processedAt) : undefined}
      />

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {fulfillmentStatus !== 'N/A' ? <OrderStatusPill status={fulfillmentStatus} /> : null}
            {order.confirmationNumber ? (
              <span className="text-ds-small text-muted-foreground">
                Confirmation: {order.confirmationNumber}
              </span>
            ) : null}
          </div>
          <LocalizedLink
            href="/account/orders"
            className={cn(buttonVariants({size: 'sm', variant: 'outline'}), 'gap-1.5')}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to orders
          </LocalizedLink>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-3">
          <AccountCard className="md:col-span-2" title="Items">
            <ul className="grid divide-y divide-border">
              {lineItems.map((item) => (
                <OrderLineRow key={item.id} item={item} />
              ))}
            </ul>
          </AccountCard>

          <div className="grid gap-4">
            <AccountCard title="Order summary">
              <dl className="grid gap-2 text-ds-regular">
                {order.subtotal ? (
                  <SummaryRow label="Subtotal">
                    <Money as="span" data={order.subtotal} />
                  </SummaryRow>
                ) : null}
                {hasDiscount ? (
                  <SummaryRow label="Discounts">
                    {discountPercentage ? (
                      <span>-{discountPercentage}%</span>
                    ) : discountValue ? (
                      <Money as="span" data={discountValue} />
                    ) : null}
                  </SummaryRow>
                ) : null}
                {order.totalShipping ? (
                  <SummaryRow label="Shipping">
                    <Money as="span" data={order.totalShipping} />
                  </SummaryRow>
                ) : null}
                {order.totalTax ? (
                  <SummaryRow label="Tax">
                    <Money as="span" data={order.totalTax} />
                  </SummaryRow>
                ) : null}
                <div className="flex items-center justify-between border-t border-border pt-2 font-medium">
                  <dt>Total</dt>
                  <dd className="font-mono tabular-nums">
                    <Money as="span" data={order.totalPrice} />
                  </dd>
                </div>
              </dl>
              <a
                href={order.statusPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({size: 'sm', variant: 'outline'}), 'w-fit')}
              >
                View order status
              </a>
            </AccountCard>

            {shippingLines.length > 0 ? (
              <AccountCard title="Shipping address">
                <address className="text-ds-regular text-muted-foreground not-italic">
                  {shippingLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </AccountCard>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryRow({children, label}: {children: React.ReactNode; label: string}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">{children}</dd>
    </div>
  );
}

function OrderLineRow({item}: {item: OrderLineItemFullFragment}) {
  const currencyCode = item.price?.currencyCode;
  const lineTotal =
    Number(item.price?.amount ?? 0) * item.quantity - Number(item.totalDiscount?.amount ?? 0);
  return (
    <li className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-ds-md bg-muted">
        {item.image ? (
          <Image data={item.image} sizes="64px" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-ds-regular font-medium">{item.title}</p>
        {item.variantTitle ? (
          <p className="truncate text-ds-small text-muted-foreground">{item.variantTitle}</p>
        ) : null}
        <p className="text-ds-small text-muted-foreground">Qty {item.quantity}</p>
      </div>
      {currencyCode ? (
        <Money
          as="span"
          data={{amount: String(lineTotal), currencyCode}}
          className="font-mono text-ds-regular tabular-nums"
        />
      ) : null}
    </li>
  );
}