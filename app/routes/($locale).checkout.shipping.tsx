import {redirect} from 'react-router';
import type {Route} from './+types/($locale).checkout.shipping';

// Next had a custom shipping step; Shopify checkout now collects this, so old links land on the cart.
export function loader({params}: Route.LoaderArgs) {
  const prefix = params.locale ? `/${params.locale}` : '';
  return redirect(`${prefix}/cart`, 301);
}