import {redirect} from 'react-router';
import type {Route} from './+types/($locale).account._index';

export function loader({params}: Route.LoaderArgs) {
  const prefix = params.locale ? `/${params.locale}` : '';
  return redirect(`${prefix}/account/profile`);
}