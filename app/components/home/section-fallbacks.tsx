// Suspense fallbacks that hold the final section height so streamed content does not shift the page.
export function ShowcaseFallback() {
  return <div className="min-h-160 md:min-h-144" aria-hidden />;
}
export function NewsletterFallback() {
  return <div className="min-h-64" aria-hidden />;
}
