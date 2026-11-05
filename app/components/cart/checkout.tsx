import {cn} from 'cn';
import {Loader2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Button, buttonVariants} from '~/components/ui/button';
import {COPY} from './copy';
import {useCartPending} from './use-cart-pending';

export function CartCheckout({checkoutUrl, hasLines}: {checkoutUrl?: string; hasLines: boolean}) {
  const isUpdating = useCartPending();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Back button restores the page from bfcache; clear the "Redirecting" state.
  useEffect(() => {
    const reset = () => setIsRedirecting(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  if (!checkoutUrl || !hasLines || isUpdating || isRedirecting) {
    const busy = isUpdating || isRedirecting;
    return (
      <Button
        type="button"
        disabled
        aria-busy={busy || undefined}
        aria-label={COPY.checkoutLabel}
        className="h-12 w-full justify-center"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {isRedirecting ? COPY.redirecting : isUpdating ? COPY.updatingCart : COPY.checkout}
      </Button>
    );
  }

  return (
    <a
      href={checkoutUrl}
      aria-label={COPY.checkoutLabel}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        setIsRedirecting(true);
      }}
      className={cn(buttonVariants(), 'h-12 w-full justify-center')}
    >
      {COPY.checkout}
    </a>
  );
}
