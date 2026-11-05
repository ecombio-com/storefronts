// Path: app/routes/($locale).blogs.$blogHandle.$articleHandle.tsx
// Old /blogs/<blog>/<article> URLs now live at /blogs/articles/<article>.
import {redirect} from 'react-router';
import type {Route} from './+types/($locale).blogs.$blogHandle.$articleHandle';
import {getLocaleFromRequest} from '~/lib/i18n';

export async function loader({params, request}: Route.LoaderArgs) {
  const {pathPrefix} = getLocaleFromRequest(request);
  throw redirect(`${pathPrefix}/blogs/articles/${params.articleHandle}`, 301);
}

export default function ArticleRedirect() {
  return null;
}
