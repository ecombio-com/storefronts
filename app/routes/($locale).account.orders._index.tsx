import {flattenConnection, getPaginationVariables, Money} from '@shopify/hydrogen';
import {cn} from 'cn';
import {Package} from 'lucide-react';
import {useRef, type FormEvent} from 'react';
import {useLoaderData, useNavigation, useSearchParams} from 'react-router';
import type {CustomerOrdersFragment, OrderItemFragment} from 'customer-accountapi.generated';
import type {Route} from './+types/($locale).account.orders._index';
import {formatOrderDate, OrderStatusPill} from '~/components/account/order-display';
import {AccountPageHeader} from '~/components/account/page-header';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {buttonVariants} from '~/components/ui/button';
import LocalizedLink from '~/components/ui/localized-link';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {
  buildOrderSearchQuery,
  ORDER_FILTER_FIELDS,
  parseOrderFilters,
  type OrderFilterParams,
} from '~/lib/orderFilters';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

const INPUT =
  'h-10 w-full rounded-ds-md border border-border bg-background px-3 text-ds-regular outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  await customerAccount.handleAuthStatus();
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <>
      <AccountPageHeader title="Orders" description="Shipping tracking, customer service, etc." />
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="grid gap-4" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="grid justify-items-center gap-5 rounded-ds-md bg-card px-6 py-16 text-center shadow-sm">
      <span className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Package className="size-8 text-muted-foreground" aria-hidden="true" />
      </span>
      {hasFilters ? (
        <>
          <div className="grid gap-2.5">
            <h2 className="text-ds-large font-medium">No orders found</h2>
            <p className="max-w-md text-ds-regular text-muted-foreground">
              No orders match your search.
            </p>
          </div>
          <LocalizedLink href="/account/orders" className={cn(buttonVariants(), 'h-10 px-6')}>
            Clear filters
          </LocalizedLink>
        </>
      ) : (
        <>
          <div className="grid gap-2.5">
            <h2 className="text-ds-large font-medium">No orders yet</h2>
            <p className="max-w-md text-ds-regular text-muted-foreground">
              Once you place an order, you can track it, get help and find your receipts here.
            </p>
          </div>
          <LocalizedLink href="/collections/all" className={cn(buttonVariants(), 'h-10 px-6')}>
            Start shopping
          </LocalizedLink>
          <p className="text-ds-small text-muted-foreground">
            Ordered with a different email? Sign in with that email to see those orders.
          </p>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({currentFilters}: {currentFilters: OrderFilterParams}) {
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' && navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber) params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Search orders"
      className="grid gap-3 rounded-ds-md bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-center"
    >
      <input
        type="search"
        name={ORDER_FILTER_FIELDS.NAME}
        placeholder="Order #"
        aria-label="Order number"
        defaultValue={currentFilters.name || ''}
        className={INPUT}
      />
      <input
        type="search"
        name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
        placeholder="Confirmation #"
        aria-label="Confirmation number"
        defaultValue={currentFilters.confirmationNumber || ''}
        className={INPUT}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSearching}
          className={cn(buttonVariants(), 'h-10 px-5 disabled:opacity-50')}
        >
          {isSearching ? 'Searching' : 'Search'}
        </button>
        {hasFilters ? (
          <button
            type="button"
            disabled={isSearching}
            className={cn(buttonVariants({variant: 'outline'}), 'h-10 px-5 disabled:opacity-50')}
            onClick={() => {
              setSearchParams(new URLSearchParams());
              formRef.current?.reset();
            }}
          >
            Clear
          </button>
        ) : null}
      </div>
    </form>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const href = `/account/orders/${btoa(order.id)}`;
  return (
    <section className="grid gap-4 rounded-ds-md bg-card p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
      <div className="grid gap-1">
        <LocalizedLink
          href={href}
          className="text-ds-medium font-medium transition-opacity hover:opacity-70"
        >
          Order #{order.number}
        </LocalizedLink>
        <p className="text-ds-small text-muted-foreground">{formatOrderDate(order.processedAt)}</p>
        {order.confirmationNumber ? (
          <p className="text-ds-small text-muted-foreground">
            Confirmation: {order.confirmationNumber}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {order.financialStatus ? <OrderStatusPill status={order.financialStatus} /> : null}
          {fulfillmentStatus ? <OrderStatusPill status={fulfillmentStatus} /> : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
        <Money
          as="span"
          data={order.totalPrice}
          className="font-mono text-ds-medium font-medium tabular-nums"
        />
        <LocalizedLink
          href={href}
          className={cn(buttonVariants({size: 'sm', variant: 'outline'}))}
        >
          View order
        </LocalizedLink>
      </div>
    </section>
  );
}