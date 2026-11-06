// Path: app/routes/($locale).api.showcase.$handle.tsx
// Resource route: products for one showcase tab, fetched when a visitor opens it.
import type {Route} from './+types/($locale).api.showcase.$handle';
import {getShowcaseTabProducts} from '~/lib/home-showcase.server';

export async function loader({context, params}: Route.LoaderArgs) {
  const handle = params.handle ?? '';
  return {handle, products: await getShowcaseTabProducts(context.storefront, handle, context.yotpo)};
}
