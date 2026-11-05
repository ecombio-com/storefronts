import {ChevronDownIcon} from '~/components/ui/icons';
import {parseAccordions} from '~/lib/product';

export function FrequentlyAskedQuestionsSection({html}: {html: string | null}) {
  const items = html ? parseAccordions(html) : [];
  return (
    <section data-slot="frequently-asked-questions">
      <h2 className="text-ds-h3 font-semibold">Frequently Asked Questions</h2>
      <div className="mt-5">
        {items.length > 0 ? (
          <div className="divide-y border-y">
            {items.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-ds-regular font-medium [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="size-6 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div
                  className="prose prose-sm mt-3 max-w-none text-foreground/80"
                  dangerouslySetInnerHTML={{__html: item.answer}}
                />
              </details>
            ))}
          </div>
        ) : html ? (
          <div
            className="prose prose-sm max-w-none text-foreground/80"
            dangerouslySetInnerHTML={{__html: html}}
          />
        ) : (
          <p className="text-ds-regular text-foreground/60">
            Frequently asked questions aren't available for this product yet.
          </p>
        )}
      </div>
    </section>
  );
}