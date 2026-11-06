import {Newsletter} from '~/components/footer/newsletter';

export function NewsletterSection({privacyHref}: {privacyHref?: string}) {
  return (
    <section
      aria-label="Newsletter"
      className="rounded-ds-lg bg-card px-ds-medium py-ds-large shadow-ds-drop-xs ring-1 ring-border-subtle md:px-ds-large md:py-ds-xlarge"
    >
      <Newsletter variant="centered" privacyHref={privacyHref} />
    </section>
  );
}
