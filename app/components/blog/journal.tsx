// Path: app/components/blog/journal.tsx
// Shared journal pieces: header band, breadcrumbs, hero, index sections, tag chips.
import {Fragment, type ReactNode} from 'react';
import {ArticleCard} from '~/components/blog/article-card';
import {Container} from '~/components/ui/container';
import Link from '~/components/ui/localized-link';
import type {BlogTag, JournalSection} from '~/lib/blog';

const CRUMB = 'font-medium transition-opacity hover:opacity-70';

export function BlogHeader({children}: {children: ReactNode}) {
  return (
    <header className="bg-(--color-brand-primary) text-(--color-text-dark)">
      <Container className="grid justify-items-start gap-(--spacer-medium) py-(--spacer-large) md:py-(--spacer-xlarge)">
        {children}
      </Container>
    </header>
  );
}

export function BlogCrumbs({items}: {items: Array<{href?: string; label: string}>}) {
  return (
    <nav aria-label="Breadcrumb" className="justify-self-start text-ds-small">
      <ol className="flex flex-wrap items-center gap-(--spacer-xsmall)">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li
                aria-current={last ? 'page' : undefined}
                className={last ? 'line-clamp-1' : undefined}
              >
                {item.href && !last ? (
                  <Link className={CRUMB} href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
              {last ? null : <li aria-hidden="true">›</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export function JournalHero({
  jumps,
  subtitle,
  title,
}: {
  jumps: Array<{href: string; label: string}>;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="bg-(--color-brand-primary) text-(--color-text-dark)">
      <Container className="grid gap-(--spacer-regular) py-(--padding-section-medium)">
        <h1 className="font-(family-name:--font-heading) font-semibold text-(length:--heading-h1) tracking-tight">
          {title}
        </h1>
        <p className="max-w-xl text-(length:--text-medium)">{subtitle}</p>
        {jumps.length > 0 ? (
          <nav
            aria-label="Journal sections"
            className="flex flex-wrap gap-(--spacer-small) pt-(--spacer-small)"
          >
            {jumps.map((jump) => (
              <a
                className="inline-flex items-center gap-(--spacer-xsmall) rounded-full bg-(--color-bg-secondary) px-(--spacer-regular) py-(--spacer-xsmall) font-medium text-ds-small transition-opacity hover:opacity-70"
                href={jump.href}
                key={jump.href}
              >
                {jump.label}
                <span aria-hidden="true">↘</span>
              </a>
            ))}
          </nav>
        ) : null}
      </Container>
    </div>
  );
}

export function JournalSectionBlock({section}: {section: JournalSection}) {
  const titleId = `${section.id}-title`;
  return (
    <Container
      aria-labelledby={titleId}
      className="scroll-mt-(--spacer-xlarge) py-(--padding-section-medium)"
      id={section.id}
    >
      <header className="grid justify-items-start gap-(--spacer-small)">
        <h2
          className="font-(family-name:--font-heading) font-semibold text-(length:--heading-h2) tracking-tight"
          id={titleId}
        >
          {section.title}
        </h2>
        <p className="max-w-2xl text-(length:--text-regular)">{section.subtitle}</p>
        {section.chips.length > 0 ? (
          <nav
            aria-label={`${section.title} topics`}
            className="flex flex-wrap justify-start gap-(--spacer-small) pt-(--spacer-small)"
          >
            {section.chips.map((chip) => (
              <Link
                className="rounded-full bg-(--color-bg-secondary) px-(--spacer-regular) py-(--spacer-xsmall) font-medium text-ds-small shadow-(--shadow-drop-xs) transition-opacity hover:opacity-70"
                href={`/blogs/tag/${chip.handle}`}
                key={chip.handle}
              >
                {chip.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      <div className="mt-(--spacer-large) grid grid-cols-1 gap-(--grid-gutter) sm:grid-cols-2 lg:grid-cols-4">
        {section.entries.map(({article, category}) => (
          <ArticleCard article={article} category={category} compact key={article.handle} />
        ))}
      </div>
    </Container>
  );
}

export function TagChips({active, tags}: {active?: string; tags: BlogTag[]}) {
  if (tags.length === 0) return null;
  return (
    <nav aria-label="Article tags" className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          aria-current={tag.handle === active ? 'page' : undefined}
          className={
            tag.handle === active
              ? 'border border-foreground bg-foreground px-3 py-1.5 text-background text-ds-small'
              : 'border px-3 py-1.5 text-muted-foreground text-ds-small hover:border-foreground hover:text-foreground'
          }
          href={`/blogs/tag/${tag.handle}`}
          key={tag.handle}
        >
          {tag.label}
        </Link>
      ))}
    </nav>
  );
}
