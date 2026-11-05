import {useFetchers} from 'react-router';

// True while any CartForm action (lines, discounts) is in flight.
export function useCartPending() {
  return useFetchers().some(
    (fetcher) => fetcher.state !== 'idle' && Boolean(fetcher.formAction?.includes('/cart')),
  );
}
