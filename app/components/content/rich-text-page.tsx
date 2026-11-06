import {ArticleBody} from '~/components/blog/article-body';
import {Container} from '~/components/ui/container';
import {Page} from '~/components/ui/page';
import {Prose} from '~/components/ui/prose';
import {parseBody} from '~/lib/shortcodes';

export function RichTextPage({body, title}: {body: string; title: string}) {
  return (
    <Page>
      <Container className="max-w-2xl">
        <Prose>
          <h1>{title}</h1>
        </Prose>
        <div className="mt-6">{body.trim() ? <ArticleBody products={{}} segments={parseBody(body)} /> : null}</div>
      </Container>
    </Page>
  );
}
