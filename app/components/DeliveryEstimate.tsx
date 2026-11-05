import {useEffect, useRef, useState} from 'react';
import {estimateDelivery, genericRanges} from '~/lib/zip/delivery';
import {saveZip, useZipCode} from '~/lib/zip/use-zip-code';

function formatRange(a: Date, b: Date) {
  const f = new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'});
  if (a.getTime() === b.getTime()) return f.format(a);
  return f.formatRange(a, b);
}

export function DeliveryEstimate({delivery}: {delivery?: {handlingDaysMin?: number | undefined; handlingDaysMax?: number | undefined; transitExtraDays?: number | undefined}}) {
  const zip = useZipCode() ?? '';
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => setMounted(true), []);

  const {handling, transit} = genericRanges(delivery);
  let headline = `Ships in ${handling} business days, arrives in ${transit} business days`;
  if (mounted) {
    const {arriveMin, arriveMax} = estimateDelivery(delivery);
    headline = `Free delivery by ${formatRange(arriveMin, arriveMax)}`;
  }

  return (
    <div className="mt-4 rounded-lg bg-[#dce4ff] px-4 py-3 text-base text-neutral-900">
      <p className="flex items-center gap-3 font-semibold">
        <span aria-hidden>🚚</span>
        {headline}
      </p>
      <div className="mt-3 flex items-center gap-3 border-t border-black/10 pt-3">
        <span aria-hidden>📍</span>
        <span>Ship to</span>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            setDraft(zip);
            dialog.current?.showModal();
          }}
          className="font-semibold underline underline-offset-2 hover:opacity-70"
        >
          {zip || 'Enter ZIP code'}
        </button>
      </div>

      <dialog
        ref={dialog}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/50"
      >
        <form
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\d{5}$/.test(draft)) return;
            saveZip(draft);
            dialog.current?.close();
          }}
        >
          <div className="relative border-b pb-4 text-center">
            <h2>Delivery estimate</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="absolute right-0 top-0 hover:opacity-70"
            >
              ✕
            </button>
          </div>
          <p className="pt-5 text-lg font-bold">Update ZIP code</p>
          <p className="mb-4 mt-1">Enter your ZIP code to see your delivery date.</p>
          <div className="flex gap-3">
            <input
              inputMode="numeric"
              maxLength={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
              placeholder="ZIP code"
              aria-label="ZIP code"
              className="h-12 min-w-0 flex-1 rounded-md border px-3"
            />
            <button
              type="submit"
              disabled={draft.length !== 5}
              className="h-12 rounded-md bg-black px-6 font-medium text-white disabled:opacity-40"
            >
              Update
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
