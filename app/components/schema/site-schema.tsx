const SOCIAL_PROFILES: string[] = [];

export function buildSiteSchema(origin: string, searchUrl = `${origin}/search`) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: 'Ecombio',
      legalName: 'Ecombio, Inc.',
      url: origin,
      logo: `${origin}/og-default.png`,
      description:
        'Ecombio, Inc. is an American multinational e-commerce company focusing on the micro-mobility market. Our catalog is comprised of electric bikes, electric scooters and electric skateboards from top brands, with free shipping and a 1-year warranty.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '9702 Bolsa Ave',
        addressLocality: 'Westminster',
        addressRegion: 'CA',
        postalCode: '92683',
        addressCountry: 'US',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+1-657-364-9088',
        email: 'support@ecombio.com',
        areaServed: 'US',
        availableLanguage: 'English',
      },
      ...(SOCIAL_PROFILES.length > 0 ? {sameAs: SOCIAL_PROFILES} : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: 'Ecombio',
      alternateName: ['Ecombio.com'],
      url: origin,
      publisher: {'@id': `${origin}/#organization`},
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${searchUrl}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export function SiteSchema({origin, searchUrl}: {origin: string; searchUrl?: string}) {
  return (
    <>
      {buildSiteSchema(origin, searchUrl).map((schema) => (
        <script key={schema['@type']} type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
      ))}
    </>
  );
}
