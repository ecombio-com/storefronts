export const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
      requiresSellingPlan
    }
    selectedOptions {
      name
      value
    }
    sellingPlanAllocations(first: 100) {
      nodes {
        priceAdjustments {
          compareAtPrice {
            amount
            currencyCode
          }
          price {
            amount
            currencyCode
          }
        }
        sellingPlan {
          id
          name
          description
          recurringDeliveries
        }
      }
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

export const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    availableForSale
    isGiftCard
    variantsCount { count }
    priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
    handlingDaysMin: metafield(namespace: "custom", key: "handling_days_min") { value }
    handlingDaysMax: metafield(namespace: "custom", key: "handling_days_max") { value }
    transitExtraDays: metafield(namespace: "custom", key: "transit_extra_days") { value }
    popularSearches: metafield(namespace: "custom", key: "popular_searches") { value }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    featuredImage {
      url
      altText
      width
      height
    }
    media(first: 10) {
      nodes {
        __typename
        mediaContentType
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
        ... on Video {
          id
          previewImage {
            url
            altText
            width
            height
          }
          sources {
            url
            mimeType
            width
            height
          }
        }
      }
    }
    collections(first: 10) {
      nodes {
        handle
        title
      }
    }
    trustBadges: metafield(namespace: "custom", key: "trust_badges") {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    url
                    altText
                  }
                }
                ... on GenericFile {
                  url
                }
              }
            }
          }
        }
      }
    }
    specs: metafield(namespace: "custom", key: "product_specs") {
      references(first: 12) {
        nodes {
          ... on Metaobject {
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    url
                    altText
                  }
                }
                ... on GenericFile {
                  url
                }
              }
            }
          }
        }
      }
    }
    faq: metafield(namespace: "custom", key: "frequently_asked_questions") {
      reference {
        ... on Page {
          body
        }
      }
    }
    techSpecs: metafield(namespace: "custom", key: "technical_specifications") {
      reference {
        ... on Page {
          body
        }
      }
    }
    ownersManual: metafield(namespace: "custom", key: "owners_manual") {
      reference {
        ... on GenericFile {
          url
        }
      }
    }
    assemblyVideo: metafield(namespace: "custom", key: "assembly_video") {
      value
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

export const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;