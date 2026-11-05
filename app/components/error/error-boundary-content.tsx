import {AlertCircleIcon} from 'lucide-react';
import {Button} from '~/components/ui/button';

export function ErrorBoundaryContent({status, message}: {status: number; message?: string}) {
  const notFound = status === 404;
  return (
    <div className="flex flex-col items-center justify-center px-ds-global py-ds-xlarge text-center">
      <div className="mb-ds-medium flex justify-center">
        <div className="rounded-full bg-muted p-ds-medium">
          <AlertCircleIcon className="size-12 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
      <h1 className="mb-2 text-ds-h2">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p className="mb-ds-large max-w-md text-muted-foreground">
        {notFound
          ? "We couldn't find the page you were looking for."
          : 'An unexpected error occurred. Please try again.'}
      </p>
      {import.meta.env.DEV && message ? (
        <pre className="mb-ds-large max-w-full overflow-x-auto rounded-ds-md bg-muted p-ds-regular text-left text-ds-small">
          {message}
        </pre>
      ) : null}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {!notFound && <Button onClick={() => window.location.reload()}>Try again</Button>}
        <Button variant="outline" asChild>
          <a href="/">Go to the home page</a>
        </Button>
      </div>
    </div>
  );
}
