import LocalizedLink from '~/components/ui/localized-link';

export function PopularSearches({terms}: {terms: string[]}) {
  if (terms.length === 0) return null;
  return (
    <section
      aria-labelledby="popular-searches-title"
      className="mt-ds-large"
      data-slot="popular-searches"
    >
      <h2 id="popular-searches-title" className="text-ds-h3 font-semibold">
        Popular searches
      </h2>
      <ul className="mt-5 flex flex-wrap gap-2">
        {terms.map((term) => (
          <li key={term}>
            <LocalizedLink
              href={`/search?q=${encodeURIComponent(term)}`}
              className="inline-flex rounded-ds-md bg-black px-3 py-1.5 text-ds-regular font-medium text-white"
            >
              {term}
            </LocalizedLink>
          </li>
        ))}
      </ul>
    </section>
  );
}