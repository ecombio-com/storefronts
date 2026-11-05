// Path: app/routes/($locale).blogs.$blogHandle._index.tsx
// Old /blogs/<blog> URLs now live at /blogs/category/<blog>.
import {redirect} from 'react-router';
import type {Route} from './+types/($locale).blogs.$blogHandle._index';
import {getLocaleFromRequest} from '~/lib/i18n';

export async function loader({params, request}: Route.LoaderArgs) {
  const {pathPrefix} = getLocaleFromRequest(request);
  throw redirect(`${pathPrefix}/blogs/category/${params.blogHandle}`, 301);
}

export default function BlogRedirect() {
  return null;
}
