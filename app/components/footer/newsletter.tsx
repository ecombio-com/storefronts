import {cn} from 'cn';
import {Mail} from 'lucide-react';
import {useId, useState} from 'react';
import {useFetcher} from 'react-router';
import {ChevronDownIcon} from '~/components/ui/icons';
import LocalizedLink from '~/components/ui/localized-link';

type NewsletterProps = {
  privacyHref?: string;
  variant?: 'inline' | 'centered';
  title?: string;
  description?: string;
};

export function Newsletter({
  privacyHref,
  variant = 'inline',
  title = 'Stay in the loop',
  description = 'Be the first to hear about new arrivals, exclusive deals and news.',
}: NewsletterProps) {
  const fetcher = useFetcher<{status: 'idle' | 'success' | 'error'; message?: string}>();
  const state = fetcher.data ?? {status: 'idle' as const};
  const pending = fetcher.state !== 'idle';
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const noteId = useId();
  const centered = variant === 'centered';

  return (
    <div className={cn('flex flex-col gap-6', centered ? 'mx-auto max-w-xl items-center text-center' : 'md:flex-row md:items-start md:justify-between')}>
      <div className={centered ? undefined : 'max-w-sm'}>
        <h2 className="text-ds-regular font-semibold">{title}</h2>
        <p className="mt-1 text-ds-regular text-muted-foreground">{description}</p>
      </div>

      <div className={cn('w-full', centered ? 'text-left' : 'md:max-w-md')}>
        <fetcher.Form method="post" action="/api/newsletter" className="flex gap-2">
          <label htmlFor={inputId} className="sr-only">Email</label>
          <div className="relative flex-1">
            <input
              id={inputId}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className="h-10 w-full rounded-ds-md border border-border bg-card pl-3 pr-10 text-ds-regular outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            />
            <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-10 shrink-0 rounded-ds-md bg-foreground px-4 text-ds-regular font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Signing up...' : 'Sign up'}
          </button>
        </fetcher.Form>

        <p role="status" className={cn('text-ds-regular', state.message && 'mt-2', state.status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>
          {state.message}
        </p>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={noteId}
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 text-ds-regular transition-opacity hover:opacity-70"
        >
          <ChevronDownIcon className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
          Learn more
        </button>
        <div id={noteId} hidden={!open} className="mt-2 text-ds-regular text-muted-foreground">
          <p>
            By signing up, you agree to receive marketing emails from us. You can unsubscribe at any
            time using the link in any email we send, and you can ask to access, correct or delete
            your data.
          </p>
          {privacyHref && (
            <p className="mt-2">
              <LocalizedLink href={privacyHref} className="font-semibold text-foreground transition-opacity hover:opacity-70">
                Read our privacy policy
              </LocalizedLink>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
