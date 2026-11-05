import type {Route} from './+types/($locale).api.newsletter';

type State = {status: 'idle' | 'success' | 'error'; message?: string};
type UserError = {field: string[] | null; message: string};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = 'Something went wrong. Please try again later.';
const SUCCESS = 'Thanks for subscribing!';
const CONSENT = {marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN'};

const CREATE_CUSTOMER = `
  mutation ($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;
const FIND_CUSTOMER = `
  query ($query: String!) {
    customers(first: 1, query: $query) {
      nodes { id emailMarketingConsent { marketingState } }
    }
  }
`;
const UPDATE_CONSENT = `
  mutation ($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

let cachedToken: {value: string; expiresAt: number} | null = null;

async function getAdminToken(shop: string, id: string, secret: string) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({grant_type: 'client_credentials', client_id: id, client_secret: secret}),
  });
  if (!response.ok) throw new Error(`Admin token request failed: ${response.status}`);
  const json = (await response.json()) as {access_token?: string; expires_in?: number};
  if (!json.access_token) throw new Error('Admin token missing in response');
  cachedToken = {value: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000};
  return json.access_token;
}

async function adminQuery<T>(shop: string, version: string, token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://${shop}/admin/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
    body: JSON.stringify({query, variables}),
  });
  if (!response.ok) throw new Error(`Admin API request failed: ${response.status}`);
  const json = (await response.json()) as {data?: T; errors?: unknown};
  if (json.errors || !json.data) throw new Error(`Admin API error: ${JSON.stringify(json.errors)}`);
  return json.data;
}

export async function action({request, context}: Route.ActionArgs): Promise<State> {
  if (request.method !== 'POST') return {status: 'error', message: GENERIC_ERROR};

  const env = context.env as unknown as Record<string, string | undefined>;
  const shop = env.PUBLIC_STORE_DOMAIN;
  const clientId = env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = env.SHOPIFY_ADMIN_CLIENT_SECRET;
  const version = env.SHOPIFY_API_VERSION || '2026-10';

  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return {status: 'error', message: 'Please enter a valid email address.'};
  }
  if (!shop || !clientId || !clientSecret) {
    console.error('[newsletter] Shopify admin credentials are missing');
    return {status: 'error', message: GENERIC_ERROR};
  }

  try {
    const token = await getAdminToken(shop, clientId, clientSecret);
    const created = await adminQuery<{customerCreate: {customer: {id: string} | null; userErrors: UserError[]}}>(
      shop, version, token, CREATE_CUSTOMER,
      {input: {email, tags: ['newsletter'], emailMarketingConsent: CONSENT}},
    );
    const errors = created.customerCreate.userErrors;
    if (errors.length === 0) return {status: 'success', message: SUCCESS};
    if (!errors.some((e) => /taken|already/i.test(e.message))) {
      console.error('[newsletter] customerCreate failed', errors);
      return {status: 'error', message: GENERIC_ERROR};
    }

    const found = await adminQuery<{customers: {nodes: {id: string; emailMarketingConsent: {marketingState: string} | null}[]}}>(
      shop, version, token, FIND_CUSTOMER, {query: `email:"${email.replace(/["\\]/g, '')}"`},
    );
    const customer = found.customers.nodes[0];
    if (!customer) return {status: 'error', message: GENERIC_ERROR};

    if (customer.emailMarketingConsent?.marketingState !== 'SUBSCRIBED') {
      const updated = await adminQuery<{customerEmailMarketingConsentUpdate: {userErrors: UserError[]}}>(
        shop, version, token, UPDATE_CONSENT,
        {input: {customerId: customer.id, emailMarketingConsent: CONSENT}},
      );
      if (updated.customerEmailMarketingConsentUpdate.userErrors.length > 0) {
        return {status: 'error', message: GENERIC_ERROR};
      }
    }
    return {status: 'success', message: SUCCESS};
  } catch (error) {
    console.error('[newsletter] signup failed', error);
    return {status: 'error', message: GENERIC_ERROR};
  }
}
