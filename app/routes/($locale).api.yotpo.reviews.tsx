// Path: app/routes/($locale).api.yotpo.reviews.tsx
// Receives the review form, validates it, forwards it to Yotpo.
// The client sends only the product HANDLE; ID, title and image are re-derived
// from Shopify so a caller can't post reviews to arbitrary products.
// Spam protection: honeypot + validation. Add a rate-limit rule at the edge.

import type {Route} from './+types/($locale).api.yotpo.reviews';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE_RE = /^[a-z0-9][a-z0-9_-]*$/i;
const MAX_BODY_BYTES = 8 * 1024;

const PRODUCT_FOR_REVIEW_QUERY = `#graphql
  query YotpoReviewProduct(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      handle
      title
      featuredImage {
        url
      }
    }
  }
` as const;

function bad(error: string, status = 400) {
  return Response.json({error}, {status});
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') return bad('Method not allowed.', 405);

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return bad('Request too large.', 413);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad('Invalid request.');
  }

  // Honeypot filled in: pretend it worked so bots don't adapt.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return Response.json({ok: true});
  }

  const handle = typeof body.handle === 'string' ? body.handle : '';
  const score = body.score;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!HANDLE_RE.test(handle)) return bad('Invalid product.');
  if (
    typeof score !== 'number' ||
    !Number.isInteger(score) ||
    score < 1 ||
    score > 5
  ) {
    return bad('Choose a star rating.');
  }
  if (name.length < 1 || name.length > 60) return bad('Enter your name.');
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return bad('Enter a valid email address.');
  }
  if (title.length < 1 || title.length > 100) return bad('Enter a review title.');
  if (content.length < 10 || content.length > 2000) {
    return bad('Your review must be between 10 and 2000 characters.');
  }

  try {
    const result = (await context.storefront.query(PRODUCT_FOR_REVIEW_QUERY, {
      variables: {handle},
    })) as {
      product: {
        id: string;
        handle: string;
        title: string;
        featuredImage?: {url: string} | null;
      } | null;
    };
    const product = result.product;
    const productId = product?.id.split('/').pop() ?? '';
    if (!product || !/^\d+$/.test(productId)) {
      return bad('Product not found.', 404);
    }

    const origin = new URL(request.url).origin;
    const {language, country} = context.storefront.i18n;
    const prefix = `/${language}-${country}`.toLowerCase();
    const ok = await context.yotpo.submitReview({
      productId,
      productTitle: product.title,
      productUrl: `${origin}${prefix}/products/${product.handle}`,
      productImageUrl: product.featuredImage?.url,
      name,
      email,
      title,
      content,
      score,
    });
    if (!ok) {
      return bad("We couldn't submit your review. Please try again later.", 502);
    }
    return Response.json({ok: true});
  } catch (err) {
    console.error('Yotpo review route error:', err);
    return bad("We couldn't submit your review. Please try again later.", 502);
  }
}
