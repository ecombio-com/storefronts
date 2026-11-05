import {ChevronDownIcon} from '~/components/ui/icons';

export function TechnicalSpecsSection({html}: {html: string | null}) {
  if (!html) return null;
  return (
    <details open className="group" data-slot="technical-specifications">
      <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <h2 className="text-ds-h3 font-semibold">Technical Specifications</h2>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-6 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="mt-5">
        <div className="ds-specs" dangerouslySetInnerHTML={{__html: html}} />
      </div>
    </details>
  );
}