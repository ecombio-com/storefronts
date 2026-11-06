import {getSeoMeta} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).pages.$handle';
import {PageBlocks} from '~/components/content/page-blocks';
import {RichTextPage} from '~/components/content/rich-text-page';
import {isHiddenPageHandle} from '~/lib/hidden-pages';
import {pageBlocksFromBody, parsePageBlocks} from '~/lib/page-blocks';

export const meta: Route.MetaFunction = ({data}) =>
  data
    ? (getSeoMeta({
        title: data.seo.title,
        description: data.seo.description,
        url: data.canonical,
      }) ?? [])
    : [];

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle || isHiddenPageHandle(handle)) {
    throw new Response('Not Found', {status: 404});
  }

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {handle},
    cache: context.storefront.CacheLong(),
  });
  if (!page) throw new Response('Not Found', {status: 404});

  const bodyBlocks = pageBlocksFromBody(page.body);
  const layoutBlocks = parsePageBlocks(page.layoutBlocks?.value);

  // Same precedence as Next: shortcode layout in body, then layout_blocks metafield, then rich text.
  const blocks = bodyBlocks.some((b) => b.type !== 'body')
    ? bodyBlocks
    : layoutBlocks.length > 0
      ? layoutBlocks
      : null;

  const url = new URL(request.url);
  return {
    blocks,
    body: blocks ? null : page.body,
    title: page.title,
    canonical: `${url.origin}${url.pathname}`,
    seo: {
      title: page.seo?.title ?? page.title,
      description: page.seo?.description ?? page.bodySummary,
    },
  };
}

export default function ShopifyPage() {
  const {blocks, body, title} = useLoaderData<typeof loader>();
  if (blocks) return <PageBlocks blocks={blocks} />;
  return <RichTextPage body={body ?? ''} title={title} />;
}

const PAGE_QUERY = `#graphql
  query Page($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    page(handle: $handle) {
      id
      handle
      title
      body
      bodySummary
      updatedAt
      seo {
        title
        description
      }
      layoutBlocks: metafield(namespace: "custom", key: "layout_blocks") {
        value
      }
    }
  }
` as const;
