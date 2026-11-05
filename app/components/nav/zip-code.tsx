import {ArrowLeft, MapPin, Search, X} from 'lucide-react';
import {type FormEvent, type ReactNode, useRef, useState} from 'react';

import {ChevronDownIcon} from '~/components/ui/icons';
import {COUNTRIES, flagUrl, getCountry} from '~/lib/zip/countries';
import {saveCountry, useCountry} from '~/lib/zip/use-country';
import {saveZip, useZipCode} from '~/lib/zip/use-zip-code';

// All visible text in one place, ready to move into use-intl.
const COPY = {
  back: 'Back',
  close: 'Close',
  deliveringTo: (zip: string) => `Delivering to ${zip}`,
  updateZip: 'Update ZIP code',
  deliveryEstimate: 'Delivery estimate',
  deliveryNote: 'Delivery options and speed may vary depending on location.',
  zipCode: 'ZIP code',
  update: 'Update',
  switchCountry: 'Switch country',
  changeNote:
    'Changing your location might affect your delivery address options, price, product availability, and currency.',
  searchCountry: 'Search your country',
  currentCountry: 'Current country & language',
  language: 'Language',
  noMatch: (q: string) => `No countries match "${q}".`,
};

type View = 'zip' | 'country';

function ModalHeader({title, onBack, onClose}: {title: string; onBack?: () => void; onClose: () => void}) {
  return (
    <div className="relative border-b border-border pb-4 text-center">
      {onBack ? (
        <button
          type="button"
          aria-label={COPY.back}
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full hover:opacity-70"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
      ) : null}
      <h2 id="zip-modal-title" className="text-ds-regular">
        {title}
      </h2>
      <button
        type="button"
        aria-label={COPY.close}
        onClick={onClose}
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full hover:opacity-70"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function Flag({code}: {code: string}) {
  return <img src={flagUrl(code)} alt="" width={20} height={14} className="h-3.5 w-5 object-cover" />;
}

export function ZipCode({trigger}: {trigger?: (open: () => void, zip: string) => ReactNode} = {}) {
  const zip = useZipCode() ?? '';
  const country = useCountry();
  const current = getCountry(country.code);

  const [view, setView] = useState<View>('zip');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function openModal() {
    setView('zip');
    setDraft(zip);
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{5}$/.test(draft)) return;
    saveZip(draft);
    closeModal();
  }

  const others = COUNTRIES.filter(
    (c) => c.code !== current.code && c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      {trigger ? (
        trigger(openModal, zip)
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={openModal}
          className="flex items-center gap-1.5 whitespace-nowrap underline transition-opacity hover:opacity-70"
        >
          <MapPin className="size-3.5" aria-hidden="true" />
          {zip ? COPY.deliveringTo(zip) : COPY.updateZip}
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="zip-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
        onClose={() => {
          setView('zip');
          setQuery('');
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-ds-lg bg-popover p-0 text-foreground shadow-ds-drop-lg backdrop:bg-scrim backdrop:backdrop-blur-(--scrim-blur)"
      >
        <div className="p-6">
          {view === 'zip' ? (
            <>
              <ModalHeader title={COPY.deliveryEstimate} onClose={closeModal} />
              <form onSubmit={save} className="pt-5">
                <p className="text-ds-medium font-bold">{COPY.updateZip}</p>
                <p className="mb-4 mt-1 text-ds-regular">{COPY.deliveryNote}</p>
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    inputMode="numeric"
                    maxLength={5}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
                    placeholder={COPY.zipCode}
                    aria-label={COPY.zipCode}
                    className="h-12 min-w-0 flex-1 rounded-ds-md border border-border bg-popover px-3 text-ds-regular placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    disabled={draft.length !== 5}
                    className="h-12 rounded-ds-md bg-primary px-6 text-ds-regular font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                  >
                    {COPY.update}
                  </button>
                </div>
              </form>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setView('country');
                }}
                className="mt-5 text-ds-regular font-bold underline hover:opacity-70"
              >
                {COPY.switchCountry}
              </button>
            </>
          ) : (
            <>
              <ModalHeader title={COPY.switchCountry} onBack={() => setView('zip')} onClose={closeModal} />
              <p className="pt-5 text-ds-regular">{COPY.changeNote}</p>

              <div className="relative mt-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={COPY.searchCountry}
                  aria-label={COPY.searchCountry}
                  className="h-11 w-full rounded-ds-md border border-border bg-popover pl-3 pr-10 text-ds-regular placeholder:text-muted-foreground"
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
              </div>

              <div className="mt-4 max-h-[45vh] overflow-y-auto pr-1">
                <p className="text-ds-regular font-bold">{COPY.currentCountry}</p>
                <div className="flex items-center justify-between border-b border-border py-3 text-ds-regular">
                  <span className="flex items-center gap-2">
                    <Flag code={current.code} />
                    {current.name}
                  </span>
                  <span className="relative flex items-center">
                    <select
                      aria-label={COPY.language}
                      value={country.language}
                      onChange={(e) => saveCountry({code: current.code, language: e.target.value})}
                      className="appearance-none bg-transparent pr-5 text-right"
                    >
                      {current.languages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-0 size-5" aria-hidden="true" />
                  </span>
                </div>

                <ul>
                  {others.map((c) => (
                    <li key={c.code}>
                      <button
                        type="button"
                        onClick={() => {
                          saveCountry({code: c.code, language: c.languages[0] ?? ''});
                          setView('zip');
                        }}
                        className="flex w-full items-center justify-between py-3 text-left text-ds-regular hover:opacity-70"
                      >
                        <span className="flex items-center gap-2">
                          <Flag code={c.code} />
                          {c.name}
                        </span>
                        <span>{c.languages[0]}</span>
                      </button>
                    </li>
                  ))}
                  {others.length === 0 ? <li className="py-3 text-ds-regular">{COPY.noMatch(query)}</li> : null}
                </ul>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
