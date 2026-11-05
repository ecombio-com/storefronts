import {AlertTriangle, X} from 'lucide-react';
import {useState} from 'react';
import {COPY} from './copy';

type CartMessage = {code?: string | null; message: string};

export type CartActionData = {
  errors?: CartMessage[] | null;
  warnings?: CartMessage[] | null;
};

export function CartWarnings({data}: {data?: CartActionData}) {
  const userErrors = data?.errors ?? [];
  const warnings = data?.warnings ?? [];
  if (!userErrors.length && !warnings.length) return null;
  return (
    <CartWarningMessages
      key={JSON.stringify([userErrors, warnings])}
      userErrors={userErrors}
      warnings={warnings}
    />
  );
}

function CartWarningMessages({
  userErrors,
  warnings,
}: {
  userErrors: CartMessage[];
  warnings: CartMessage[];
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const messages = [...userErrors, ...warnings];
  return (
    <div
      role={userErrors.length ? 'alert' : 'status'}
      className="rounded-ds-md border border-(--color-warning)/30 bg-(--color-warning)/5 px-3 py-2.5 text-ds-regular text-(--color-warning)"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        <div className="grid flex-1 gap-1">
          <p className="font-medium">
            {userErrors.length ? COPY.warningError : COPY.warningUpdated}
          </p>
          <ul className="grid gap-0.5">
            {messages.map((message, index) => (
              <li key={`${message.code}:${index}`}>{message.message}</li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={COPY.dismiss}
          className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-ds-md hover:bg-(--color-warning)/10"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
