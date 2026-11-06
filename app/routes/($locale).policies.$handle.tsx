import {getSeoMeta} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).policies.$handle';
import {RichTextPage} from '~/components/content/rich-text-page';

export const meta: Route.MetaFunction = ({data}) =>
  data ? (getSeoMeta({title: data.policy.title, url: data.canonical}) ?? []) : [];

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Response('Not Found', {status: 404});

  const {shop} = await context.storefront.query(SHOP_POLICIES_QUERY, {
    cache: context.storefront.CacheLong(),
  });

  // Same lookup as Next: gather every policy that exists, match on handle.
  const policy = Object.values(shop ?? {}).find(
    (p): p is {body: string; handle: string; title: string} =>
      typeof p === 'object' && p !== null && 'handle' in p && p.handle === handle,
  );
  if (!policy) throw new Response('Not Found', {status: 404});

  const url = new URL(request.url);
  return {
    policy: {body: policy.body, handle: policy.handle, title: policy.title},
    canonical: `${url.origin}${url.pathname}`,
  };
}

export default function PolicyPage() {
  const {policy} = useLoaderData<typeof loader>();
  return <RichTextPage body={policy.body} title={policy.title} />;
}

const SHOP_POLICIES_QUERY = `#graphql
  fragment ShopPolicyFields on ShopPolicy {
    body
    handle
    title
  }
  query ShopPolicies($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      contactInformation { ...ShopPolicyFields }
      legalNotice { ...ShopPolicyFields }
      privacyPolicy { ...ShopPolicyFields }
      refundPolicy { ...ShopPolicyFields }
      shippingPolicy { ...ShopPolicyFields }
      termsOfSale { ...ShopPolicyFields }
      termsOfService { ...ShopPolicyFields }
    }
  }
` as const;
