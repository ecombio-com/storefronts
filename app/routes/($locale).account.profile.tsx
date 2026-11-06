import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {cn} from 'cn';
import type {CustomerFragment} from 'customer-accountapi.generated';
import {data, Form, useActionData, useNavigation, useOutletContext} from 'react-router';
import type {Route} from './+types/($locale).account.profile';
import {AccountCard} from '~/components/account/account-card';
import {AccountPageHeader} from '~/components/account/page-header';
import {buttonVariants} from '~/components/ui/button';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

const INPUT =
  'h-10 w-full rounded-ds-md border border-border bg-background px-3 text-ds-regular outline-none focus-visible:ring-2 focus-visible:ring-ring/50';
const LABEL = 'text-ds-small font-medium';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <>
      <AccountPageHeader title="Profile" description="Manage your personal details." />
      <AccountCard title="Personal information">
        <Form method="PUT" className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className={LABEL} htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                defaultValue={customer.firstName ?? ''}
                minLength={2}
                className={INPUT}
              />
            </div>
            <div className="grid gap-1.5">
              <label className={LABEL} htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                defaultValue={customer.lastName ?? ''}
                minLength={2}
                className={INPUT}
              />
            </div>
          </div>
          {action?.error ? (
            <p role="alert" className="text-ds-small text-destructive">
              {action.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={state !== 'idle'}
            className={cn(buttonVariants(), 'h-10 w-fit px-6 disabled:opacity-50')}
          >
            {state !== 'idle' ? 'Updating' : 'Update'}
          </button>
        </Form>
      </AccountCard>
    </>
  );
}