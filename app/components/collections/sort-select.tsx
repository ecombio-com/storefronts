// Path: app/components/collections/sort-select.tsx
import {useNavigate, useSearchParams} from 'react-router';
import {Select, SelectContent, SelectItem, SelectTrigger} from '~/components/ui/select';
import {parseBrowseParams, SORT_OPTIONS, toBrowseHref} from '~/lib/collection-browse';

export function SortSelect({exclude}: {exclude?: string[]}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = parseBrowseParams(searchParams);
  const options = exclude ? SORT_OPTIONS.filter((o) => !exclude.includes(o.value)) : SORT_OPTIONS;
  return (
    <Select
      value={state.sortBy}
      onValueChange={(value) =>
        navigate(toBrowseHref({...state, sortBy: value ?? 'manual'}), {preventScrollReset: true})
      }
    >
      <SelectTrigger className="rounded-full border-transparent bg-secondary px-4 shadow-none hover:border-border">
        <span>Sort</span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
