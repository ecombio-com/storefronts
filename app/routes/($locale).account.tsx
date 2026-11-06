import {data as remixData, Outlet, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).account';
import {AccountTabs} from '~/components/account/account-tabs';
import {SignOutButton} from '~/components/account/sign-out-button';
import {Container} from '~/components/ui/container';
import {Page} from '~/components/ui/page';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export const meta: Route.MetaFunction = () => [
  {title: 'Account'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  await customerAccount.handleAuthStatus();
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  return (
    <Page className="flex flex-1 flex-col bg-muted">
      <Container className="flex flex-1 flex-col gap-6 pb-12">
        <div className="ml-auto w-28 pt-4">
          <SignOutButton />
        </div>
        <AccountTabs />
        <div className="mx-auto grid w-full max-w-5xl gap-5">
          <Outlet context={{customer}} />
        </div>
      </Container>
    </Page>
  );
}