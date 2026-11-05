// Path: app/routes/($locale).blogs._index.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blogs._index';
import {JournalHero, JournalSectionBlock, TagChips} from '~/components/blog/journal';
import {Container} from '~/components/ui/container';
import {Page} from '~/components/ui/page';
import {
  buildMeta,
  collectTags,
  FALLBACK_SECTION_ID,
  groupIntoSections,
  type JournalEntry,
} from '~/lib/blog';
import {getBlog, getBlogList, getUrls} from '~/lib/blog.server';

const TITLE = 'Journal: E-Bike Guides, Tips & Stories';
const DESCRIPTION =
  'Electric bike buying guides, maintenance tips and rider stories from Ecombio. Find the right e-bike and keep it running great.';

export const meta: Route.MetaFunction = ({data}) =>
  buildMeta({description: DESCRIPTION, title: TITLE, url: data?.canonicalUrl ?? '/blogs'});

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const blogs = await getBlogList(storefront);
  const loaded = await Promise.all(blogs.map((b) => getBlog(storefront, b.handle, 50)));

  const seen = new Set<string>();
  const entries: JournalEntry[] = [];
  for (const blog of loaded) {
    if (!blog) continue;
    for (const article of blog.articles) {
      if (seen.has(article.handle)) continue;
      seen.add(article.handle);
      entries.push({article, category: blog.title});
    }
  }
  entries.sort((a, b) => Date.parse(b.article.publishedAt) - Date.parse(a.article.publishedAt));

  const sections = groupIntoSections(entries);
  return {
    canonicalUrl: getUrls(request).canonical,
    jumps: sections
      .filter((s) => s.id !== FALLBACK_SECTION_ID)
      .map((s) => ({href: `#${s.id}`, label: s.title})),
    sections,
    tags: collectTags(entries.map((e) => e.article)).slice(0, 12),
  };
}

export default function BlogsIndexRoute() {
  const {jumps, sections, tags} = useLoaderData<typeof loader>();
  return (
    <Page className="pt-0">
      <JournalHero
        jumps={jumps}
        subtitle="Buying guides, maintenance tips and stories for every e-bike rider."
        title="The Ecombio Journal"
      />
      {sections.length > 0 ? (
        sections.map((section) => <JournalSectionBlock key={section.id} section={section} />)
      ) : (
        <Container className="py-(--padding-section-medium)">
          <p className="text-center text-muted-foreground">No articles found.</p>
        </Container>
      )}
      {tags.length > 0 ? (
        <Container className="grid justify-items-center gap-(--spacer-regular) py-(--padding-section-medium)">
          <h2 className="font-(family-name:--font-heading) font-semibold text-(length:--heading-h2) tracking-tight">
            All topics
          </h2>
          <TagChips tags={tags} />
        </Container>
      ) : null}
    </Page>
  );
}
