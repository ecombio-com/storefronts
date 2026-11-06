/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type JournalArticleFragment = Pick<
  StorefrontAPI.Article,
  'content' | 'excerpt' | 'handle' | 'publishedAt' | 'title' | 'tags'
> & {
  authorV2?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'altText' | 'height' | 'url' | 'width'>
  >;
  seo?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Seo, 'description' | 'title'>>;
  authorProfile?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        name?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        role?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        bio?: StorefrontAPI.Maybe<Pick<StorefrontAPI.MetaobjectField, 'value'>>;
        photo?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        }>;
      }
    >;
  }>;
};

export type JournalBlogListQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type JournalBlogListQuery = {
  blogs: {
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'handle' | 'title'> & {
        parentBlog?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
      }
    >;
  };
};

export type JournalBlogQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type JournalBlogQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'handle' | 'title'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
      articles: {
        nodes: Array<
          Pick<
            StorefrontAPI.Article,
            'content' | 'excerpt' | 'handle' | 'publishedAt' | 'title' | 'tags'
          > & {
            authorV2?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'altText' | 'height' | 'url' | 'width'>
            >;
            seo?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Seo, 'description' | 'title'>
            >;
            authorProfile?: StorefrontAPI.Maybe<{
              reference?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metaobject, 'handle'> & {
                  name?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MetaobjectField, 'value'>
                  >;
                  role?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MetaobjectField, 'value'>
                  >;
                  bio?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MetaobjectField, 'value'>
                  >;
                  photo?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<{
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    }>;
                  }>;
                }
              >;
            }>;
          }
        >;
      };
    }
  >;
};

export type JournalArticleByHandleQueryVariables = StorefrontAPI.Exact<{
  articleHandle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type JournalArticleByHandleQuery = {
  blogs: {
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'handle' | 'title'> & {
        articleByHandle?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Article,
            | 'contentHtml'
            | 'content'
            | 'excerpt'
            | 'handle'
            | 'publishedAt'
            | 'title'
            | 'tags'
          > & {
            authorV2?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'altText' | 'height' | 'url' | 'width'>
            >;
            seo?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Seo, 'description' | 'title'>
            >;
            authorProfile?: StorefrontAPI.Maybe<{
              reference?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metaobject, 'handle'> & {
                  name?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MetaobjectField, 'value'>
                  >;
                  role?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MetaobjectField, 'value'>
                  >;
                  bio?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MetaobjectField, 'value'>
                  >;
                  photo?: StorefrontAPI.Maybe<{
                    reference?: StorefrontAPI.Maybe<{
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    }>;
                  }>;
                }
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type JournalProductsQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type JournalProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'vendor' | 'tags' | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        cardBadge?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        cardSpecsText?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        cardSpecs?: StorefrontAPI.Maybe<{
          references?: StorefrontAPI.Maybe<{
            nodes: Array<{
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }>;
          }>;
        }>;
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
      }
    >;
  };
};

export type CollectionParentQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionParentQuery = {
  collection?: StorefrontAPI.Maybe<{
    metafield?: StorefrontAPI.Maybe<{
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Collection, 'handle' | 'title'>
      >;
    }>;
  }>;
};

export type CollectionPickedDealsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionPickedDealsQuery = {
  collection?: StorefrontAPI.Maybe<{
    deals?: StorefrontAPI.Maybe<{
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'handle' | 'title' | 'vendor' | 'tags' | 'availableForSale'
          > & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            cardBadge?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            cardSpecsText?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            cardSpecs?: StorefrontAPI.Maybe<{
              references?: StorefrontAPI.Maybe<{
                nodes: Array<{
                  fields: Array<
                    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
                  >;
                }>;
              }>;
            }>;
            selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              }
            >;
            options: Array<
              Pick<StorefrontAPI.ProductOption, 'name'> & {
                optionValues: Array<
                  Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                    swatch?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                        image?: StorefrontAPI.Maybe<{
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        }>;
                      }
                    >;
                  }
                >;
              }
            >;
          }
        >;
      }>;
    }>;
  }>;
};

export type CollectionDealsScanQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionDealsScanQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<
          StorefrontAPI.Product,
          'id' | 'handle' | 'title' | 'vendor' | 'tags' | 'availableForSale'
        > & {
          featuredImage?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
          priceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            maxVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          compareAtPriceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          cardBadge?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'value'>
          >;
          cardSpecsText?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'value'>
          >;
          cardSpecs?: StorefrontAPI.Maybe<{
            references?: StorefrontAPI.Maybe<{
              nodes: Array<{
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
                >;
              }>;
            }>;
          }>;
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
            }
          >;
          options: Array<
            Pick<StorefrontAPI.ProductOption, 'name'> & {
              optionValues: Array<
                Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                  swatch?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                      image?: StorefrontAPI.Maybe<{
                        previewImage?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url'>
                        >;
                      }>;
                    }
                  >;
                }
              >;
            }
          >;
        }
      >;
      pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
    };
  }>;
};

export type CollectionReviewCandidatesQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionReviewCandidatesQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>>;
    };
  }>;
};

export type CollectionAfterItemQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionAfterItemQuery = {
  collection?: StorefrontAPI.Maybe<{
    afterItem?: StorefrontAPI.Maybe<{
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Page, 'id' | 'title' | 'body'>
      >;
    }>;
  }>;
};

export type CollectionArticlesQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionArticlesQuery = {
  collection?: StorefrontAPI.Maybe<{
    posts?: StorefrontAPI.Maybe<{
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<
            StorefrontAPI.Article,
            'handle' | 'title' | 'publishedAt' | 'excerpt'
          > & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            blog: Pick<StorefrontAPI.Blog, 'handle' | 'title'>;
          }
        >;
      }>;
    }>;
  }>;
};

export type CollectionLayoutQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionLayoutQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id'> & {
      layout?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
    }
  >;
};

export type CollectionHubQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionHubQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description' | 'updatedAt'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'title' | 'description'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      hero?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          fields: Array<
            Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
              reference?: StorefrontAPI.Maybe<
                | {
                    __typename:
                      | 'Article'
                      | 'Collection'
                      | 'GenericFile'
                      | 'Metaobject'
                      | 'Model3d'
                      | 'Page'
                      | 'ProductVariant'
                      | 'Video';
                  }
                | ({__typename: 'MediaImage'} & {
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  })
                | ({__typename: 'Product'} & Pick<
                    StorefrontAPI.Product,
                    | 'id'
                    | 'handle'
                    | 'title'
                    | 'vendor'
                    | 'tags'
                    | 'availableForSale'
                  > & {
                      featuredImage?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                      priceRange: {
                        minVariantPrice: Pick<
                          StorefrontAPI.MoneyV2,
                          'amount' | 'currencyCode'
                        >;
                        maxVariantPrice: Pick<
                          StorefrontAPI.MoneyV2,
                          'amount' | 'currencyCode'
                        >;
                      };
                      compareAtPriceRange: {
                        minVariantPrice: Pick<
                          StorefrontAPI.MoneyV2,
                          'amount' | 'currencyCode'
                        >;
                      };
                      cardBadge?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Metafield, 'value'>
                      >;
                      cardSpecsText?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Metafield, 'value'>
                      >;
                      cardSpecs?: StorefrontAPI.Maybe<{
                        references?: StorefrontAPI.Maybe<{
                          nodes: Array<{
                            fields: Array<
                              Pick<
                                StorefrontAPI.MetaobjectField,
                                'key' | 'value'
                              >
                            >;
                          }>;
                        }>;
                      }>;
                      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.ProductVariant,
                          'id' | 'availableForSale'
                        > & {
                          selectedOptions: Array<
                            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                          >;
                        }
                      >;
                      options: Array<
                        Pick<StorefrontAPI.ProductOption, 'name'> & {
                          optionValues: Array<
                            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                              swatch?: StorefrontAPI.Maybe<
                                Pick<
                                  StorefrontAPI.ProductOptionValueSwatch,
                                  'color'
                                > & {
                                  image?: StorefrontAPI.Maybe<{
                                    previewImage?: StorefrontAPI.Maybe<
                                      Pick<StorefrontAPI.Image, 'url'>
                                    >;
                                  }>;
                                }
                              >;
                            }
                          >;
                        }
                      >;
                    })
              >;
            }
          >;
        }>;
      }>;
      guides?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<
            Pick<StorefrontAPI.Article, 'id' | 'title' | 'handle'> & {
              blog: Pick<StorefrontAPI.Blog, 'handle'>;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
            }
          >;
        }>;
      }>;
      subCollections?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<
            Pick<StorefrontAPI.Collection, 'id' | 'handle' | 'title'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              products: {
                nodes: Array<
                  Pick<StorefrontAPI.Product, 'id'> & {
                    featuredImage?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  }
                >;
              };
            }
          >;
        }>;
      }>;
      posts?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<
            Pick<
              StorefrontAPI.Article,
              'id' | 'handle' | 'title' | 'excerpt'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
            }
          >;
        }>;
      }>;
      afterItem?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Page, 'id' | 'title' | 'body'>
        >;
      }>;
    }
  >;
};

export type LatestArticlesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type LatestArticlesQuery = {
  articles: {
    nodes: Array<
      Pick<StorefrontAPI.Article, 'id' | 'handle' | 'title' | 'excerpt'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
      }
    >;
  };
};

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  parentRelationship?: StorefrontAPI.Maybe<{
    parent: Pick<StorefrontAPI.CartLine, 'id'>;
  }>;
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  lineComponents: Array<
    Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
      attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
      cost: {
        totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        amountPerQuantity: Pick<
          StorefrontAPI.MoneyV2,
          'currencyCode' | 'amount'
        >;
        compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
      };
      merchandise: Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'availableForSale' | 'requiresShipping' | 'title'
      > & {
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        product: Pick<
          StorefrontAPI.Product,
          'handle' | 'title' | 'id' | 'vendor'
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      };
      parentRelationship?: StorefrontAPI.Maybe<{
        parent: Pick<StorefrontAPI.CartLine, 'id'>;
      }>;
    }
  >;
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  appliedGiftCards: Array<
    Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
      amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    }
  >;
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          parentRelationship?: StorefrontAPI.Maybe<{
            parent: Pick<StorefrontAPI.CartLine, 'id'>;
          }>;
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          lineComponents: Array<
            Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
              attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
              cost: {
                totalAmount: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                amountPerQuantity: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
              };
              merchandise: Pick<
                StorefrontAPI.ProductVariant,
                'id' | 'availableForSale' | 'requiresShipping' | 'title'
              > & {
                compareAtPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                product: Pick<
                  StorefrontAPI.Product,
                  'handle' | 'title' | 'id' | 'vendor'
                >;
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              };
              parentRelationship?: StorefrontAPI.Maybe<{
                parent: Pick<StorefrontAPI.CartLine, 'id'>;
              }>;
            }
          >;
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type NavImageFragment = Pick<
  StorefrontAPI.Image,
  'url' | 'altText' | 'width' | 'height'
>;

type NavResource_D1dx05ATf4g2laN1JqcXry7MmGap4KVncwFCvGwn7m4_Fragment = {};

type NavResource_Collection_Fragment = {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
  products: {
    nodes: Array<{
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
    }>;
  };
};

export type NavResourceFragment =
  | NavResource_D1dx05ATf4g2laN1JqcXry7MmGap4KVncwFCvGwn7m4_Fragment
  | NavResource_Collection_Fragment;

export type NavLeafFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'title' | 'type' | 'url'
> & {
  resource?: StorefrontAPI.Maybe<{
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
    products: {
      nodes: Array<{
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
      }>;
    };
  }>;
};

export type NavChildFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'type' | 'url'> & {
      resource?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        products: {
          nodes: Array<{
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        };
      }>;
    }
  >;
  resource?: StorefrontAPI.Maybe<{
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
    products: {
      nodes: Array<{
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
      }>;
    };
  }>;
};

export type NavMenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'type' | 'url'> & {
      items: Array<
        Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'type' | 'url'> & {
          items: Array<
            Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'type' | 'url'> & {
              resource?: StorefrontAPI.Maybe<{
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
                products: {
                  nodes: Array<{
                    featuredImage?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  }>;
                };
              }>;
            }
          >;
          resource?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            products: {
              nodes: Array<{
                featuredImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }>;
            };
          }>;
        }
      >;
      resource?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        products: {
          nodes: Array<{
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        };
      }>;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type HeaderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeaderQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'type' | 'url'> & {
          items: Array<
            Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'type' | 'url'> & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'title' | 'type' | 'url'
                > & {
                  resource?: StorefrontAPI.Maybe<{
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    products: {
                      nodes: Array<{
                        featuredImage?: StorefrontAPI.Maybe<
                          Pick<
                            StorefrontAPI.Image,
                            'url' | 'altText' | 'width' | 'height'
                          >
                        >;
                      }>;
                    };
                  }>;
                }
              >;
              resource?: StorefrontAPI.Maybe<{
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
                products: {
                  nodes: Array<{
                    featuredImage?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  }>;
                };
              }>;
            }
          >;
          resource?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            products: {
              nodes: Array<{
                featuredImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }>;
            };
          }>;
        }
      >;
    }
  >;
};

export type FooterQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FooterQuery = {
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type HomeShowcaseProductsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeShowcaseProductsQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<
          StorefrontAPI.Product,
          'id' | 'handle' | 'title' | 'vendor' | 'tags' | 'availableForSale'
        > & {
          featuredImage?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
          priceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            maxVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          compareAtPriceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          cardBadge?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'value'>
          >;
          cardSpecsText?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'value'>
          >;
          cardSpecs?: StorefrontAPI.Maybe<{
            references?: StorefrontAPI.Maybe<{
              nodes: Array<{
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
                >;
              }>;
            }>;
          }>;
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
            }
          >;
          options: Array<
            Pick<StorefrontAPI.ProductOption, 'name'> & {
              optionValues: Array<
                Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                  swatch?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                      image?: StorefrontAPI.Maybe<{
                        previewImage?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.Image, 'url'>
                        >;
                      }>;
                    }
                  >;
                }
              >;
            }
          >;
        }
      >;
    };
  }>;
};

export type HomeCmsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeCmsQuery = {
  slides: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
            }>;
          }
        >;
      }
    >;
  };
  studies: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>>;
      }
    >;
  };
  stories: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              | Pick<StorefrontAPI.GenericFile, 'url' | 'mimeType'>
              | {image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>}
              | (Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
                  featuredImage?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Image, 'url'>
                  >;
                  priceRange: {
                    minVariantPrice: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  };
                })
              | {
                  sources: Array<
                    Pick<
                      StorefrontAPI.VideoSource,
                      'url' | 'mimeType' | 'width' | 'height'
                    >
                  >;
                  previewImage?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Image, 'url'>
                  >;
                }
            >;
          }
        >;
      }
    >;
  };
};

export type HomeShowcaseQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeShowcaseQuery = {
  showcases: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
            }>;
            references?: StorefrontAPI.Maybe<{
              nodes: Array<
                | Pick<StorefrontAPI.Collection, 'handle' | 'title'>
                | (Pick<StorefrontAPI.Metaobject, 'handle'> & {
                    fields: Array<
                      Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                        reference?: StorefrontAPI.Maybe<
                          | Pick<StorefrontAPI.Collection, 'handle' | 'title'>
                          | {
                              image?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.Image, 'url'>
                              >;
                            }
                        >;
                      }
                    >;
                  })
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type HomeCategoriesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeCategoriesQuery = {
  categories: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            references?: StorefrontAPI.Maybe<{
              nodes: Array<
                Pick<StorefrontAPI.Metaobject, 'handle'> & {
                  fields: Array<
                    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                      reference?: StorefrontAPI.Maybe<
                        | (Pick<
                            StorefrontAPI.Collection,
                            'handle' | 'title'
                          > & {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          })
                        | {
                            image?: StorefrontAPI.Maybe<
                              Pick<StorefrontAPI.Image, 'url'>
                            >;
                          }
                      >;
                    }
                  >;
                }
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type HomeShopCategoriesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeShopCategoriesQuery = {
  shopCategories: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              | (Pick<StorefrontAPI.Collection, 'handle'> & {
                  image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
                })
              | {image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>}
            >;
          }
        >;
      }
    >;
  };
};

export type HomeVideoQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeVideoQuery = {
  videos: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>>;
      }
    >;
  };
};

export type HomePressQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomePressQuery = {
  press: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
            }>;
          }
        >;
      }
    >;
  };
};

export type HomeFaqQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeFaqQuery = {
  faq: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle'> & {
        fields: Array<Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>>;
      }
    >;
  };
};

export type HomeDirectoryQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeDirectoryQuery = {
  menu?: StorefrontAPI.Maybe<{
    items: Array<
      Pick<StorefrontAPI.MenuItem, 'title' | 'url'> & {
        items: Array<
          Pick<StorefrontAPI.MenuItem, 'title' | 'url'> & {
            items: Array<Pick<StorefrontAPI.MenuItem, 'title' | 'url'>>;
          }
        >;
      }
    >;
  }>;
};

export type ProductCardItemFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title' | 'vendor' | 'tags' | 'availableForSale'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  compareAtPriceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  cardBadge?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  cardSpecsText?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  cardSpecs?: StorefrontAPI.Maybe<{
    references?: StorefrontAPI.Maybe<{
      nodes: Array<{
        fields: Array<Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>>;
      }>;
    }>;
  }>;
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
    }
  >;
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<
        Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
          swatch?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
              image?: StorefrontAPI.Maybe<{
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              }>;
            }
          >;
        }
      >;
    }
  >;
};

export type ProductCrossSellQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductCrossSellQuery = {
  product?: StorefrontAPI.Maybe<{
    frequentlyBought?: StorefrontAPI.Maybe<{
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
            variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
            selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              }
            >;
          }
        >;
      }>;
    }>;
  }>;
  complementary?: StorefrontAPI.Maybe<
    Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'vendor' | 'tags' | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        cardBadge?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        cardSpecsText?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        cardSpecs?: StorefrontAPI.Maybe<{
          references?: StorefrontAPI.Maybe<{
            nodes: Array<{
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }>;
          }>;
        }>;
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
      }
    >
  >;
  related?: StorefrontAPI.Maybe<
    Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'vendor' | 'tags' | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        cardBadge?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        cardSpecsText?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        cardSpecs?: StorefrontAPI.Maybe<{
          references?: StorefrontAPI.Maybe<{
            nodes: Array<{
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }>;
          }>;
        }>;
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
      }
    >
  >;
};

export type ProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'availableForSale' | 'id' | 'sku' | 'title'
> & {
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  image?: StorefrontAPI.Maybe<
    {__typename: 'Image'} & Pick<
      StorefrontAPI.Image,
      'id' | 'url' | 'altText' | 'width' | 'height'
    >
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<
    StorefrontAPI.Product,
    'title' | 'handle' | 'requiresSellingPlan'
  >;
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  sellingPlanAllocations: {
    nodes: Array<{
      priceAdjustments: Array<{
        compareAtPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }>;
      sellingPlan: Pick<
        StorefrontAPI.SellingPlan,
        'id' | 'name' | 'description' | 'recurringDeliveries'
      >;
    }>;
  };
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
};

export type ProductFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'title'
  | 'vendor'
  | 'handle'
  | 'descriptionHtml'
  | 'description'
  | 'availableForSale'
  | 'isGiftCard'
  | 'encodedVariantExistence'
  | 'encodedVariantAvailability'
> & {
  variantsCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Count, 'count'>>;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  compareAtPriceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  handlingDaysMin?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  handlingDaysMax?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  transitExtraDays?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'>
  >;
  popularSearches?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<
        Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
          firstSelectableVariant?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.ProductVariant,
              'availableForSale' | 'id' | 'sku' | 'title'
            > & {
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              image?: StorefrontAPI.Maybe<
                {__typename: 'Image'} & Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              product: Pick<
                StorefrontAPI.Product,
                'title' | 'handle' | 'requiresSellingPlan'
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              sellingPlanAllocations: {
                nodes: Array<{
                  priceAdjustments: Array<{
                    compareAtPrice: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  }>;
                  sellingPlan: Pick<
                    StorefrontAPI.SellingPlan,
                    'id' | 'name' | 'description' | 'recurringDeliveries'
                  >;
                }>;
              };
              unitPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
          swatch?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
              image?: StorefrontAPI.Maybe<{
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              }>;
            }
          >;
        }
      >;
    }
  >;
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.ProductVariant,
      'availableForSale' | 'id' | 'sku' | 'title'
    > & {
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      image?: StorefrontAPI.Maybe<
        {__typename: 'Image'} & Pick<
          StorefrontAPI.Image,
          'id' | 'url' | 'altText' | 'width' | 'height'
        >
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<
        StorefrontAPI.Product,
        'title' | 'handle' | 'requiresSellingPlan'
      >;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      sellingPlanAllocations: {
        nodes: Array<{
          priceAdjustments: Array<{
            compareAtPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }>;
          sellingPlan: Pick<
            StorefrontAPI.SellingPlan,
            'id' | 'name' | 'description' | 'recurringDeliveries'
          >;
        }>;
      };
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }
  >;
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
  media: {
    nodes: Array<
      | ({__typename: 'ExternalVideo'} & Pick<
          StorefrontAPI.ExternalVideo,
          'mediaContentType'
        >)
      | ({__typename: 'MediaImage'} & Pick<
          StorefrontAPI.MediaImage,
          'id' | 'mediaContentType'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          })
      | ({__typename: 'Model3d'} & Pick<
          StorefrontAPI.Model3d,
          'mediaContentType'
        >)
      | ({__typename: 'Video'} & Pick<
          StorefrontAPI.Video,
          'id' | 'mediaContentType'
        > & {
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            sources: Array<
              Pick<
                StorefrontAPI.VideoSource,
                'url' | 'mimeType' | 'width' | 'height'
              >
            >;
          })
    >;
  };
  collections: {
    nodes: Array<Pick<StorefrontAPI.Collection, 'handle' | 'title'>>;
  };
  trustBadges?: StorefrontAPI.Maybe<{
    references?: StorefrontAPI.Maybe<{
      nodes: Array<{
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              | Pick<StorefrontAPI.GenericFile, 'url'>
              | {
                  image?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Image, 'url' | 'altText'>
                  >;
                }
            >;
          }
        >;
      }>;
    }>;
  }>;
  specs?: StorefrontAPI.Maybe<{
    references?: StorefrontAPI.Maybe<{
      nodes: Array<{
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              | Pick<StorefrontAPI.GenericFile, 'url'>
              | {
                  image?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Image, 'url' | 'altText'>
                  >;
                }
            >;
          }
        >;
      }>;
    }>;
  }>;
  faq?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Page, 'body'>>;
  }>;
  techSpecs?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Page, 'body'>>;
  }>;
  ownersManual?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<Pick<StorefrontAPI.GenericFile, 'url'>>;
  }>;
  assemblyVideo?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  adjacentVariants: Array<
    Pick<
      StorefrontAPI.ProductVariant,
      'availableForSale' | 'id' | 'sku' | 'title'
    > & {
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      image?: StorefrontAPI.Maybe<
        {__typename: 'Image'} & Pick<
          StorefrontAPI.Image,
          'id' | 'url' | 'altText' | 'width' | 'height'
        >
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<
        StorefrontAPI.Product,
        'title' | 'handle' | 'requiresSellingPlan'
      >;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      sellingPlanAllocations: {
        nodes: Array<{
          priceAdjustments: Array<{
            compareAtPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }>;
          sellingPlan: Pick<
            StorefrontAPI.SellingPlan,
            'id' | 'name' | 'description' | 'recurringDeliveries'
          >;
        }>;
      };
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }
  >;
  seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
};

export type ProductQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'vendor'
      | 'handle'
      | 'descriptionHtml'
      | 'description'
      | 'availableForSale'
      | 'isGiftCard'
      | 'encodedVariantExistence'
      | 'encodedVariantAvailability'
    > & {
      variantsCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Count, 'count'>>;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      compareAtPriceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      handlingDaysMin?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      handlingDaysMax?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      transitExtraDays?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      popularSearches?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<
            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
              firstSelectableVariant?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'availableForSale' | 'id' | 'sku' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  image?: StorefrontAPI.Maybe<
                    {__typename: 'Image'} & Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  product: Pick<
                    StorefrontAPI.Product,
                    'title' | 'handle' | 'requiresSellingPlan'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  sellingPlanAllocations: {
                    nodes: Array<{
                      priceAdjustments: Array<{
                        compareAtPrice: Pick<
                          StorefrontAPI.MoneyV2,
                          'amount' | 'currencyCode'
                        >;
                        price: Pick<
                          StorefrontAPI.MoneyV2,
                          'amount' | 'currencyCode'
                        >;
                      }>;
                      sellingPlan: Pick<
                        StorefrontAPI.SellingPlan,
                        'id' | 'name' | 'description' | 'recurringDeliveries'
                      >;
                    }>;
                  };
                  unitPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
              swatch?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                  image?: StorefrontAPI.Maybe<{
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url'>
                    >;
                  }>;
                }
              >;
            }
          >;
        }
      >;
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<
            StorefrontAPI.Product,
            'title' | 'handle' | 'requiresSellingPlan'
          >;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          sellingPlanAllocations: {
            nodes: Array<{
              priceAdjustments: Array<{
                compareAtPrice: Pick<
                  StorefrontAPI.MoneyV2,
                  'amount' | 'currencyCode'
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              }>;
              sellingPlan: Pick<
                StorefrontAPI.SellingPlan,
                'id' | 'name' | 'description' | 'recurringDeliveries'
              >;
            }>;
          };
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      media: {
        nodes: Array<
          | ({__typename: 'ExternalVideo'} & Pick<
              StorefrontAPI.ExternalVideo,
              'mediaContentType'
            >)
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'mediaContentType'
            >)
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType'
            > & {
                previewImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
                sources: Array<
                  Pick<
                    StorefrontAPI.VideoSource,
                    'url' | 'mimeType' | 'width' | 'height'
                  >
                >;
              })
        >;
      };
      collections: {
        nodes: Array<Pick<StorefrontAPI.Collection, 'handle' | 'title'>>;
      };
      trustBadges?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<{
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  | Pick<StorefrontAPI.GenericFile, 'url'>
                  | {
                      image?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }
                >;
              }
            >;
          }>;
        }>;
      }>;
      specs?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<{
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  | Pick<StorefrontAPI.GenericFile, 'url'>
                  | {
                      image?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }
                >;
              }
            >;
          }>;
        }>;
      }>;
      faq?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Page, 'body'>>;
      }>;
      techSpecs?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Page, 'body'>>;
      }>;
      ownersManual?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<Pick<StorefrontAPI.GenericFile, 'url'>>;
      }>;
      assemblyVideo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      adjacentVariants: Array<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<
            StorefrontAPI.Product,
            'title' | 'handle' | 'requiresSellingPlan'
          >;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          sellingPlanAllocations: {
            nodes: Array<{
              priceAdjustments: Array<{
                compareAtPrice: Pick<
                  StorefrontAPI.MoneyV2,
                  'amount' | 'currencyCode'
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              }>;
              sellingPlan: Pick<
                StorefrontAPI.SellingPlan,
                'id' | 'name' | 'description' | 'recurringDeliveries'
              >;
            }>;
          };
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
    }
  >;
};

export type YotpoReviewProductQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type YotpoReviewProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }
  >;
};

export type MoneyProductItemFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type ProductItemFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
};

export type CollectionBrowseQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.ProductCollectionSortKeys>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionBrowseQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description' | 'updatedAt'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'title' | 'description'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      parent?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Collection, 'handle' | 'title'>
        >;
      }>;
      subCollections?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<Pick<StorefrontAPI.Collection, 'handle' | 'title'>>;
        }>;
      }>;
      products: {
        filters: Array<
          Pick<
            StorefrontAPI.Filter,
            'id' | 'label' | 'type' | 'presentation'
          > & {
            values: Array<
              Pick<
                StorefrontAPI.FilterValue,
                'id' | 'label' | 'count' | 'input'
              > & {
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Swatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'handle' | 'title' | 'vendor' | 'tags' | 'availableForSale'
          > & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            cardBadge?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            cardSpecsText?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            cardSpecs?: StorefrontAPI.Maybe<{
              references?: StorefrontAPI.Maybe<{
                nodes: Array<{
                  fields: Array<
                    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
                  >;
                }>;
              }>;
            }>;
            selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              }
            >;
            options: Array<
              Pick<StorefrontAPI.ProductOption, 'name'> & {
                optionValues: Array<
                  Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                    swatch?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                        image?: StorefrontAPI.Maybe<{
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url'>
                          >;
                        }>;
                      }
                    >;
                  }
                >;
              }
            >;
          }
        >;
        pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
      };
    }
  >;
};

export type CollectionFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type StoreCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type StoreCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type MoneyCollectionItemFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type CollectionItemFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
};

export type CatalogQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CatalogQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type PageQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type PageQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Page,
      'id' | 'handle' | 'title' | 'body' | 'bodySummary' | 'updatedAt'
    > & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'title' | 'description'>
      >;
      layoutBlocks?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
    }
  >;
};

export type ShopPolicyFieldsFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'title'
>;

export type ShopPoliciesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ShopPoliciesQuery = {
  shop: {
    contactInformation?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'title'>
    >;
    legalNotice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'title'>
    >;
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'title'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'title'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'title'>
    >;
    termsOfSale?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'title'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'title'>
    >;
  };
};

export type PolicyItemFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type PoliciesQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type SearchProductFragment = {__typename: 'Product'} & Pick<
  StorefrontAPI.Product,
  'handle' | 'id' | 'publishedAt' | 'title' | 'trackingParameters' | 'vendor'
> & {
    selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
      }
    >;
  };

export type SearchPageFragment = {__typename: 'Page'} & Pick<
  StorefrontAPI.Page,
  'handle' | 'id' | 'title' | 'trackingParameters'
>;

export type SearchArticleFragment = {__typename: 'Article'} & Pick<
  StorefrontAPI.Article,
  'handle' | 'id' | 'title' | 'trackingParameters'
>;

export type PageInfoFragmentFragment = Pick<
  StorefrontAPI.PageInfo,
  'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
>;

export type RegularSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  term: StorefrontAPI.Scalars['String']['input'];
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type RegularSearchQuery = {
  articles: {
    nodes: Array<
      {__typename: 'Article'} & Pick<
        StorefrontAPI.Article,
        'handle' | 'id' | 'title' | 'trackingParameters'
      >
    >;
  };
  pages: {
    nodes: Array<
      {__typename: 'Page'} & Pick<
        StorefrontAPI.Page,
        'handle' | 'id' | 'title' | 'trackingParameters'
      >
    >;
  };
  products: {
    nodes: Array<
      {__typename: 'Product'} & Pick<
        StorefrontAPI.Product,
        | 'handle'
        | 'id'
        | 'publishedAt'
        | 'title'
        | 'trackingParameters'
        | 'vendor'
      > & {
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type PredictiveArticleFragment = {__typename: 'Article'} & Pick<
  StorefrontAPI.Article,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    blog: Pick<StorefrontAPI.Blog, 'handle'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictiveCollectionFragment = {__typename: 'Collection'} & Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictivePageFragment = {__typename: 'Page'} & Pick<
  StorefrontAPI.Page,
  'id' | 'title' | 'handle' | 'trackingParameters'
>;

export type PredictiveProductFragment = {__typename: 'Product'} & Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }
    >;
  };

export type PredictiveQueryFragment = {
  __typename: 'SearchQuerySuggestion';
} & Pick<
  StorefrontAPI.SearchQuerySuggestion,
  'text' | 'styledText' | 'trackingParameters'
>;

export type PredictiveSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  limit: StorefrontAPI.Scalars['Int']['input'];
  limitScope: StorefrontAPI.PredictiveSearchLimitScope;
  term: StorefrontAPI.Scalars['String']['input'];
  types?: StorefrontAPI.InputMaybe<
    | Array<StorefrontAPI.PredictiveSearchType>
    | StorefrontAPI.PredictiveSearchType
  >;
}>;

export type PredictiveSearchQuery = {
  predictiveSearch?: StorefrontAPI.Maybe<{
    articles: Array<
      {__typename: 'Article'} & Pick<
        StorefrontAPI.Article,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          blog: Pick<StorefrontAPI.Blog, 'handle'>;
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    collections: Array<
      {__typename: 'Collection'} & Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    pages: Array<
      {__typename: 'Page'} & Pick<
        StorefrontAPI.Page,
        'id' | 'title' | 'handle' | 'trackingParameters'
      >
    >;
    products: Array<
      {__typename: 'Product'} & Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            }
          >;
        }
    >;
    queries: Array<
      {__typename: 'SearchQuerySuggestion'} & Pick<
        StorefrontAPI.SearchQuerySuggestion,
        'text' | 'styledText' | 'trackingParameters'
      >
    >;
  }>;
};

interface GeneratedQueryTypes {
  '#graphql\n  query JournalBlogList($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    blogs(first: 25) {\n      nodes {\n        handle\n        title\n        parentBlog: metafield(namespace: "custom", key: "parent_blog") { value }\n      }\n    }\n  }\n': {
    return: JournalBlogListQuery;
    variables: JournalBlogListQueryVariables;
  };
  '#graphql\n  query JournalBlog($handle: String!, $first: Int!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    blog(handle: $handle) {\n      handle\n      title\n      seo {\n        description\n        title\n      }\n      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {\n        nodes {\n          ...JournalArticle\n        }\n      }\n    }\n  }\n  #graphql\n  fragment JournalArticle on Article {\n    authorV2 {\n      name\n    }\n    content(truncateAt: 240)\n    excerpt\n    handle\n    image {\n      altText\n      height\n      url\n      width\n    }\n    publishedAt\n    title\n    tags\n    seo {\n      description\n      title\n    }\n    authorProfile: metafield(namespace: "custom", key: "author_profile") {\n      reference {\n        ... on Metaobject {\n          handle\n          name: field(key: "name") { value }\n          role: field(key: "role") { value }\n          bio: field(key: "bio") { value }\n          photo: field(key: "photo") {\n            reference {\n              ... on MediaImage {\n                image { url altText width height }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n\n': {
    return: JournalBlogQuery;
    variables: JournalBlogQueryVariables;
  };
  '#graphql\n  query JournalArticleByHandle($articleHandle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    blogs(first: 25) {\n      nodes {\n        handle\n        title\n        articleByHandle(handle: $articleHandle) {\n          ...JournalArticle\n          contentHtml\n        }\n      }\n    }\n  }\n  #graphql\n  fragment JournalArticle on Article {\n    authorV2 {\n      name\n    }\n    content(truncateAt: 240)\n    excerpt\n    handle\n    image {\n      altText\n      height\n      url\n      width\n    }\n    publishedAt\n    title\n    tags\n    seo {\n      description\n      title\n    }\n    authorProfile: metafield(namespace: "custom", key: "author_profile") {\n      reference {\n        ... on Metaobject {\n          handle\n          name: field(key: "name") { value }\n          role: field(key: "role") { value }\n          bio: field(key: "bio") { value }\n          photo: field(key: "photo") {\n            reference {\n              ... on MediaImage {\n                image { url altText width height }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n\n': {
    return: JournalArticleByHandleQuery;
    variables: JournalArticleByHandleQueryVariables;
  };
  '#graphql\n  query JournalProducts($query: String!, $first: Int!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    products(first: $first, query: $query) {\n      nodes {\n        ...ProductCardItem\n      }\n    }\n  }\n  #graphql\n  fragment ProductCardItem on Product {\n    id\n    handle\n    title\n    vendor\n    tags\n    availableForSale\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice { amount currencyCode }\n      maxVariantPrice { amount currencyCode }\n    }\n    compareAtPriceRange {\n      minVariantPrice { amount currencyCode }\n    }\n    cardBadge: metafield(namespace: "custom", key: "card_badge") {\n      value\n    }\n    cardSpecsText: metafield(namespace: "custom", key: "card_specs") {\n      value\n    }\n    cardSpecs: metafield(namespace: "custom", key: "product_specs") {\n      references(first: 4) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant {\n      id\n      availableForSale\n      selectedOptions { name value }\n    }\n    options {\n      name\n      optionValues {\n        name\n        swatch {\n          color\n          image { previewImage { url } }\n        }\n      }\n    }\n  }\n\n': {
    return: JournalProductsQuery;
    variables: JournalProductsQueryVariables;
  };
  '#graphql\n  query CollectionParent($handle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      metafield(namespace: "custom", key: "parent_collection") {\n        reference { ... on Collection { handle title } }\n      }\n    }\n  }\n': {
    return: CollectionParentQuery;
    variables: CollectionParentQueryVariables;
  };
  '#graphql\n  query CollectionPickedDeals($handle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      deals: metafield(namespace: "custom", key: "deals") {\n        references(first: 8) {\n          nodes {\n            ... on Product {\n              ...ProductCardItem\n            }\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCardItem on Product {\n    id\n    handle\n    title\n    vendor\n    tags\n    availableForSale\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice { amount currencyCode }\n      maxVariantPrice { amount currencyCode }\n    }\n    compareAtPriceRange {\n      minVariantPrice { amount currencyCode }\n    }\n    cardBadge: metafield(namespace: "custom", key: "card_badge") {\n      value\n    }\n    cardSpecsText: metafield(namespace: "custom", key: "card_specs") {\n      value\n    }\n    cardSpecs: metafield(namespace: "custom", key: "product_specs") {\n      references(first: 4) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant {\n      id\n      availableForSale\n      selectedOptions { name value }\n    }\n    options {\n      name\n      optionValues {\n        name\n        swatch {\n          color\n          image { previewImage { url } }\n        }\n      }\n    }\n  }\n\n': {
    return: CollectionPickedDealsQuery;
    variables: CollectionPickedDealsQueryVariables;
  };
  '#graphql\n  query CollectionDealsScan(\n    $handle: String!\n    $after: String\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      products(first: 250, after: $after) {\n        nodes {\n          ...ProductCardItem\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCardItem on Product {\n    id\n    handle\n    title\n    vendor\n    tags\n    availableForSale\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice { amount currencyCode }\n      maxVariantPrice { amount currencyCode }\n    }\n    compareAtPriceRange {\n      minVariantPrice { amount currencyCode }\n    }\n    cardBadge: metafield(namespace: "custom", key: "card_badge") {\n      value\n    }\n    cardSpecsText: metafield(namespace: "custom", key: "card_specs") {\n      value\n    }\n    cardSpecs: metafield(namespace: "custom", key: "product_specs") {\n      references(first: 4) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant {\n      id\n      availableForSale\n      selectedOptions { name value }\n    }\n    options {\n      name\n      optionValues {\n        name\n        swatch {\n          color\n          image { previewImage { url } }\n        }\n      }\n    }\n  }\n\n': {
    return: CollectionDealsScanQuery;
    variables: CollectionDealsScanQueryVariables;
  };
  '#graphql\n  query CollectionReviewCandidates($handle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      products(first: 250) {\n        nodes {\n          id\n          handle\n          title\n        }\n      }\n    }\n  }\n': {
    return: CollectionReviewCandidatesQuery;
    variables: CollectionReviewCandidatesQueryVariables;
  };
  '#graphql\n  query CollectionAfterItem($handle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      afterItem: metafield(namespace: "custom", key: "after_item_lists") {\n        reference {\n          ... on Page {\n            id\n            title\n            body\n          }\n        }\n      }\n    }\n  }\n': {
    return: CollectionAfterItemQuery;
    variables: CollectionAfterItemQueryVariables;
  };
  '#graphql\n  query CollectionArticles($handle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      posts: metafield(namespace: "custom", key: "posts") {\n        references(first: 50) {\n          nodes {\n            ... on Article {\n              handle\n              title\n              publishedAt\n              excerpt\n              image {\n                url\n                altText\n                width\n                height\n              }\n              blog {\n                handle\n                title\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: CollectionArticlesQuery;
    variables: CollectionArticlesQueryVariables;
  };
  '#graphql\n  query CollectionLayout(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      layout: metafield(namespace: "custom", key: "layout") {\n        value\n      }\n    }\n  }\n': {
    return: CollectionLayoutQuery;
    variables: CollectionLayoutQueryVariables;
  };
  '#graphql\n  query CollectionHub(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      updatedAt\n      seo {\n        title\n        description\n      }\n      image {\n        url\n        altText\n        width\n        height\n      }\n      hero: metafield(namespace: "custom", key: "hub_hero") {\n        reference {\n          ... on Metaobject {\n            fields {\n              key\n              value\n              reference {\n                __typename\n                ... on MediaImage {\n                  image {\n                    url\n                    altText\n                    width\n                    height\n                  }\n                }\n                ... on Product {\n                  ...ProductCardItem\n                }\n              }\n            }\n          }\n        }\n      }\n      guides: metafield(namespace: "custom", key: "hub_guides") {\n        references(first: 20) {\n          nodes {\n            ... on Article {\n              id\n              title\n              handle\n              blog {\n                handle\n              }\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n      subCollections: metafield(namespace: "custom", key: "sub_collections") {\n        references(first: 20) {\n          nodes {\n            ... on Collection {\n              id\n              handle\n              title\n              image {\n                url\n                altText\n                width\n                height\n              }\n              products(first: 1) {\n                nodes {\n                  id\n                  featuredImage {\n                    url\n                    altText\n                    width\n                    height\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n      posts: metafield(namespace: "custom", key: "posts") {\n        references(first: 3) {\n          nodes {\n            ... on Article {\n              id\n              handle\n              title\n              excerpt\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n      afterItem: metafield(namespace: "custom", key: "after_item_lists") {\n        reference {\n          ... on Page {\n            id\n            title\n            body\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCardItem on Product {\n    id\n    handle\n    title\n    vendor\n    tags\n    availableForSale\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice { amount currencyCode }\n      maxVariantPrice { amount currencyCode }\n    }\n    compareAtPriceRange {\n      minVariantPrice { amount currencyCode }\n    }\n    cardBadge: metafield(namespace: "custom", key: "card_badge") {\n      value\n    }\n    cardSpecsText: metafield(namespace: "custom", key: "card_specs") {\n      value\n    }\n    cardSpecs: metafield(namespace: "custom", key: "product_specs") {\n      references(first: 4) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant {\n      id\n      availableForSale\n      selectedOptions { name value }\n    }\n    options {\n      name\n      optionValues {\n        name\n        swatch {\n          color\n          image { previewImage { url } }\n        }\n      }\n    }\n  }\n\n': {
    return: CollectionHubQuery;
    variables: CollectionHubQueryVariables;
  };
  '#graphql\n  query LatestArticles($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    articles(first: 3, sortKey: PUBLISHED_AT, reverse: true) {\n      nodes {\n        id\n        handle\n        title\n        excerpt\n        image {\n          url\n          altText\n          width\n          height\n        }\n      }\n    }\n  }\n': {
    return: LatestArticlesQuery;
    variables: LatestArticlesQueryVariables;
  };
  '#graphql\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  query Header(\n    $country: CountryCode\n    $headerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      ...Shop\n    }\n    menu(handle: $headerMenuHandle) {\n      ...NavMenu\n    }\n  }\n  #graphql\n  fragment NavImage on Image {\n    url\n    altText\n    width\n    height\n  }\n  fragment NavResource on MenuItemResource {\n    ... on Collection {\n      image {\n        ...NavImage\n      }\n      products(first: 1) {\n        nodes {\n          featuredImage {\n            ...NavImage\n          }\n        }\n      }\n    }\n  }\n  fragment NavLeaf on MenuItem {\n    id\n    title\n    type\n    url\n    resource {\n      ...NavResource\n    }\n  }\n  fragment NavChild on MenuItem {\n    ...NavLeaf\n    items {\n      ...NavLeaf\n    }\n  }\n  fragment NavMenu on Menu {\n    id\n    items {\n      ...NavLeaf\n      items {\n        ...NavChild\n      }\n    }\n  }\n\n': {
    return: HeaderQuery;
    variables: HeaderQueryVariables;
  };
  '#graphql\n  query Footer(\n    $country: CountryCode\n    $footerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    menu(handle: $footerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: FooterQuery;
    variables: FooterQueryVariables;
  };
  '#graphql\n  query HomeShowcaseProducts($handle: String!, $first: Int!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      products(first: $first) {\n        nodes {\n          ...ProductCardItem\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCardItem on Product {\n    id\n    handle\n    title\n    vendor\n    tags\n    availableForSale\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice { amount currencyCode }\n      maxVariantPrice { amount currencyCode }\n    }\n    compareAtPriceRange {\n      minVariantPrice { amount currencyCode }\n    }\n    cardBadge: metafield(namespace: "custom", key: "card_badge") {\n      value\n    }\n    cardSpecsText: metafield(namespace: "custom", key: "card_specs") {\n      value\n    }\n    cardSpecs: metafield(namespace: "custom", key: "product_specs") {\n      references(first: 4) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant {\n      id\n      availableForSale\n      selectedOptions { name value }\n    }\n    options {\n      name\n      optionValues {\n        name\n        swatch {\n          color\n          image { previewImage { url } }\n        }\n      }\n    }\n  }\n\n': {
    return: HomeShowcaseProductsQuery;
    variables: HomeShowcaseProductsQueryVariables;
  };
  '#graphql\n  query HomeCms($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    slides: metaobjects(type: "home_slide", first: 100) {\n      nodes { handle fields { key value reference { ... on MediaImage { image { url } } } } }\n    }\n    studies: metaobjects(type: "home_study", first: 100) {\n      nodes { handle fields { key value } }\n    }\n    stories: metaobjects(type: "home_story", first: 100) {\n      nodes {\n        handle\n        fields {\n          key\n          value\n          reference {\n            ... on MediaImage { image { url } }\n            ... on Video { sources { url mimeType width height } previewImage { url } }\n            ... on GenericFile { url mimeType }\n            ... on Product { id handle title featuredImage { url } priceRange { minVariantPrice { amount currencyCode } } }\n          }\n        }\n      }\n    }\n  }\n': {
    return: HomeCmsQuery;
    variables: HomeCmsQueryVariables;
  };
  '#graphql\n  query HomeShowcase($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    showcases: metaobjects(type: "home_showcase", first: 20) {\n      nodes {\n        handle\n        fields {\n          key\n          value\n          reference { ... on MediaImage { image { url } } }\n          references(first: 20) {\n            nodes {\n              ... on Collection { handle title }\n              ... on Metaobject {\n                handle\n                fields {\n                  key\n                  value\n                  reference {\n                    ... on Collection { handle title }\n                    ... on MediaImage { image { url } }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: HomeShowcaseQuery;
    variables: HomeShowcaseQueryVariables;
  };
  '#graphql\n  query HomeCategories($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    categories: metaobjects(type: "home_category", first: 20) {\n      nodes {\n        handle\n        fields {\n          key\n          value\n          references(first: 20) {\n            nodes {\n              ... on Metaobject {\n                handle\n                fields {\n                  key\n                  value\n                  reference {\n                    ... on MediaImage { image { url } }\n                    ... on Collection { handle title image { url } }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: HomeCategoriesQuery;
    variables: HomeCategoriesQueryVariables;
  };
  '#graphql\n  query HomeShopCategories($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    shopCategories: metaobjects(type: "home_shop_category", first: 50) {\n      nodes {\n        handle\n        fields {\n          key\n          value\n          reference {\n            ... on MediaImage { image { url } }\n            ... on Collection { handle image { url } }\n          }\n        }\n      }\n    }\n  }\n': {
    return: HomeShopCategoriesQuery;
    variables: HomeShopCategoriesQueryVariables;
  };
  '#graphql\n  query HomeVideo($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    videos: metaobjects(type: "home_video", first: 10) { nodes { handle fields { key value } } }\n  }\n': {
    return: HomeVideoQuery;
    variables: HomeVideoQueryVariables;
  };
  '#graphql\n  query HomePress($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    press: metaobjects(type: "home_press", first: 20) {\n      nodes { handle fields { key value reference { ... on MediaImage { image { url } } } } }\n    }\n  }\n': {
    return: HomePressQuery;
    variables: HomePressQueryVariables;
  };
  '#graphql\n  query HomeFaq($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    faq: metaobjects(type: "home_faq", first: 20) { nodes { handle fields { key value } } }\n  }\n': {
    return: HomeFaqQuery;
    variables: HomeFaqQueryVariables;
  };
  '#graphql\n  query HomeDirectory($handle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    menu(handle: $handle) {\n      items { title url items { title url items { title url } } }\n    }\n  }\n': {
    return: HomeDirectoryQuery;
    variables: HomeDirectoryQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductCardItem on Product {\n    id\n    handle\n    title\n    vendor\n    tags\n    availableForSale\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice { amount currencyCode }\n      maxVariantPrice { amount currencyCode }\n    }\n    compareAtPriceRange {\n      minVariantPrice { amount currencyCode }\n    }\n    cardBadge: metafield(namespace: "custom", key: "card_badge") {\n      value\n    }\n    cardSpecsText: metafield(namespace: "custom", key: "card_specs") {\n      value\n    }\n    cardSpecs: metafield(namespace: "custom", key: "product_specs") {\n      references(first: 4) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant {\n      id\n      availableForSale\n      selectedOptions { name value }\n    }\n    options {\n      name\n      optionValues {\n        name\n        swatch {\n          color\n          image { previewImage { url } }\n        }\n      }\n    }\n  }\n\n  query ProductCrossSell(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      frequentlyBought: metafield(namespace: "custom", key: "frequently_bought_together") {\n        references(first: 4) {\n          nodes {\n            ... on Product {\n              id\n              handle\n              title\n              featuredImage { url altText }\n              variants(first: 2) { nodes { id } }\n              selectedOrFirstAvailableVariant(ignoreUnknownOptions: true) {\n                id\n                availableForSale\n                price { amount currencyCode }\n              }\n            }\n          }\n        }\n      }\n    }\n    complementary: productRecommendations(productHandle: $handle, intent: COMPLEMENTARY) {\n      ...ProductCardItem\n    }\n    related: productRecommendations(productHandle: $handle, intent: RELATED) {\n      ...ProductCardItem\n    }\n  }\n': {
    return: ProductCrossSellQuery;
    variables: ProductCrossSellQueryVariables;
  };
  '#graphql\n  query Product(\n    $country: CountryCode\n    $handle: String!\n    $language: LanguageCode\n    $selectedOptions: [SelectedOptionInput!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      ...Product\n    }\n  }\n  #graphql\n  fragment Product on Product {\n    id\n    title\n    vendor\n    handle\n    descriptionHtml\n    description\n    availableForSale\n    isGiftCard\n    variantsCount { count }\n    priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }\n    compareAtPriceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }\n    handlingDaysMin: metafield(namespace: "custom", key: "handling_days_min") { value }\n    handlingDaysMax: metafield(namespace: "custom", key: "handling_days_max") { value }\n    transitExtraDays: metafield(namespace: "custom", key: "transit_extra_days") { value }\n    popularSearches: metafield(namespace: "custom", key: "popular_searches") { value }\n    encodedVariantExistence\n    encodedVariantAvailability\n    options {\n      name\n      optionValues {\n        name\n        firstSelectableVariant {\n          ...ProductVariant\n        }\n        swatch {\n          color\n          image {\n            previewImage {\n              url\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {\n      ...ProductVariant\n    }\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    media(first: 10) {\n      nodes {\n        __typename\n        mediaContentType\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n        ... on Video {\n          id\n          previewImage {\n            url\n            altText\n            width\n            height\n          }\n          sources {\n            url\n            mimeType\n            width\n            height\n          }\n        }\n      }\n    }\n    collections(first: 10) {\n      nodes {\n        handle\n        title\n      }\n    }\n    trustBadges: metafield(namespace: "custom", key: "trust_badges") {\n      references(first: 10) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n              reference {\n                ... on MediaImage {\n                  image {\n                    url\n                    altText\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n    specs: metafield(namespace: "custom", key: "product_specs") {\n      references(first: 12) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n              reference {\n                ... on MediaImage {\n                  image {\n                    url\n                    altText\n                  }\n                }\n                ... on GenericFile {\n                  url\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n    faq: metafield(namespace: "custom", key: "frequently_asked_questions") {\n      reference {\n        ... on Page {\n          body\n        }\n      }\n    }\n    techSpecs: metafield(namespace: "custom", key: "technical_specifications") {\n      reference {\n        ... on Page {\n          body\n        }\n      }\n    }\n    ownersManual: metafield(namespace: "custom", key: "owners_manual") {\n      reference {\n        ... on GenericFile {\n          url\n        }\n      }\n    }\n    assemblyVideo: metafield(namespace: "custom", key: "assembly_video") {\n      value\n    }\n    adjacentVariants (selectedOptions: $selectedOptions) {\n      ...ProductVariant\n    }\n    seo {\n      description\n      title\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    availableForSale\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    id\n    image {\n      __typename\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n      requiresSellingPlan\n    }\n    selectedOptions {\n      name\n      value\n    }\n    sellingPlanAllocations(first: 100) {\n      nodes {\n        priceAdjustments {\n          compareAtPrice {\n            amount\n            currencyCode\n          }\n          price {\n            amount\n            currencyCode\n          }\n        }\n        sellingPlan {\n          id\n          name\n          description\n          recurringDeliveries\n        }\n      }\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n  }\n\n\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  query YotpoReviewProduct(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      id\n      handle\n      title\n      featuredImage {\n        url\n      }\n    }\n  }\n': {
    return: YotpoReviewProductQuery;
    variables: YotpoReviewProductQueryVariables;
  };
  '#graphql\n  query CollectionBrowse(\n    $handle: String!\n    $first: Int!\n    $after: String\n    $sortKey: ProductCollectionSortKeys\n    $reverse: Boolean\n    $filters: [ProductFilter!]\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      updatedAt\n      seo {\n        title\n        description\n      }\n      image {\n        url\n        altText\n        width\n        height\n      }\n      parent: metafield(namespace: "custom", key: "parent_collection") {\n        reference {\n          ... on Collection {\n            handle\n            title\n          }\n        }\n      }\n      subCollections: metafield(namespace: "custom", key: "sub_collections") {\n        references(first: 20) {\n          nodes {\n            ... on Collection {\n              handle\n              title\n            }\n          }\n        }\n      }\n      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {\n        filters {\n          id\n          label\n          type\n          presentation\n          values {\n            id\n            label\n            count\n            input\n            swatch {\n              color\n              image {\n                previewImage {\n                  url\n                }\n              }\n            }\n          }\n        }\n        nodes {\n          ...ProductCardItem\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCardItem on Product {\n    id\n    handle\n    title\n    vendor\n    tags\n    availableForSale\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice { amount currencyCode }\n      maxVariantPrice { amount currencyCode }\n    }\n    compareAtPriceRange {\n      minVariantPrice { amount currencyCode }\n    }\n    cardBadge: metafield(namespace: "custom", key: "card_badge") {\n      value\n    }\n    cardSpecsText: metafield(namespace: "custom", key: "card_specs") {\n      value\n    }\n    cardSpecs: metafield(namespace: "custom", key: "product_specs") {\n      references(first: 4) {\n        nodes {\n          ... on Metaobject {\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant {\n      id\n      availableForSale\n      selectedOptions { name value }\n    }\n    options {\n      name\n      optionValues {\n        name\n        swatch {\n          color\n          image { previewImage { url } }\n        }\n      }\n    }\n  }\n\n': {
    return: CollectionBrowseQuery;
    variables: CollectionBrowseQueryVariables;
  };
  '#graphql\n  fragment Collection on Collection {\n    id\n    title\n    handle\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n  }\n  query StoreCollections(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collections(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor\n    ) {\n      nodes {\n        ...Collection\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: StoreCollectionsQuery;
    variables: StoreCollectionsQueryVariables;
  };
  '#graphql\n  query Catalog(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        ...CollectionItem\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n  #graphql\n  fragment MoneyCollectionItem on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment CollectionItem on Product {\n    id\n    handle\n    title\n    featuredImage {\n      id\n      altText\n      url\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...MoneyCollectionItem\n      }\n      maxVariantPrice {\n        ...MoneyCollectionItem\n      }\n    }\n  }\n\n': {
    return: CatalogQuery;
    variables: CatalogQueryVariables;
  };
  '#graphql\n  query Page($handle: String!, $country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    page(handle: $handle) {\n      id\n      handle\n      title\n      body\n      bodySummary\n      updatedAt\n      seo {\n        title\n        description\n      }\n      layoutBlocks: metafield(namespace: "custom", key: "layout_blocks") {\n        value\n      }\n    }\n  }\n': {
    return: PageQuery;
    variables: PageQueryVariables;
  };
  '#graphql\n  fragment ShopPolicyFields on ShopPolicy {\n    body\n    handle\n    title\n  }\n  query ShopPolicies($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      contactInformation { ...ShopPolicyFields }\n      legalNotice { ...ShopPolicyFields }\n      privacyPolicy { ...ShopPolicyFields }\n      refundPolicy { ...ShopPolicyFields }\n      shippingPolicy { ...ShopPolicyFields }\n      termsOfSale { ...ShopPolicyFields }\n      termsOfService { ...ShopPolicyFields }\n    }\n  }\n': {
    return: ShopPoliciesQuery;
    variables: ShopPoliciesQueryVariables;
  };
  '#graphql\n  fragment PolicyItem on ShopPolicy {\n    id\n    title\n    handle\n  }\n  query Policies ($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      privacyPolicy {\n        ...PolicyItem\n      }\n      shippingPolicy {\n        ...PolicyItem\n      }\n      termsOfService {\n        ...PolicyItem\n      }\n      refundPolicy {\n        ...PolicyItem\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesQuery;
    variables: PoliciesQueryVariables;
  };
  '#graphql\n  query RegularSearch(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $term: String!\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    articles: search(\n      query: $term,\n      types: [ARTICLE],\n      first: $first,\n    ) {\n      nodes {\n        ...on Article {\n          ...SearchArticle\n        }\n      }\n    }\n    pages: search(\n      query: $term,\n      types: [PAGE],\n      first: $first,\n    ) {\n      nodes {\n        ...on Page {\n          ...SearchPage\n        }\n      }\n    }\n    products: search(\n      after: $endCursor,\n      before: $startCursor,\n      first: $first,\n      last: $last,\n      query: $term,\n      sortKey: RELEVANCE,\n      types: [PRODUCT],\n      unavailableProducts: HIDE,\n    ) {\n      nodes {\n        ...on Product {\n          ...SearchProduct\n        }\n      }\n      pageInfo {\n        ...PageInfoFragment\n      }\n    }\n  }\n  #graphql\n  fragment SearchProduct on Product {\n    __typename\n    handle\n    id\n    publishedAt\n    title\n    trackingParameters\n    vendor\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      id\n      image {\n        url\n        altText\n        width\n        height\n      }\n      price {\n        amount\n        currencyCode\n      }\n      compareAtPrice {\n        amount\n        currencyCode\n      }\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n        title\n      }\n    }\n  }\n\n  #graphql\n  fragment SearchPage on Page {\n     __typename\n     handle\n    id\n    title\n    trackingParameters\n  }\n\n  #graphql\n  fragment SearchArticle on Article {\n    __typename\n    handle\n    id\n    title\n    trackingParameters\n  }\n\n  #graphql\n  fragment PageInfoFragment on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    startCursor\n    endCursor\n  }\n\n': {
    return: RegularSearchQuery;
    variables: RegularSearchQueryVariables;
  };
  '#graphql\n  query PredictiveSearch(\n    $country: CountryCode\n    $language: LanguageCode\n    $limit: Int!\n    $limitScope: PredictiveSearchLimitScope!\n    $term: String!\n    $types: [PredictiveSearchType!]\n  ) @inContext(country: $country, language: $language) {\n    predictiveSearch(\n      limit: $limit,\n      limitScope: $limitScope,\n      query: $term,\n      types: $types,\n    ) {\n      articles {\n        ...PredictiveArticle\n      }\n      collections {\n        ...PredictiveCollection\n      }\n      pages {\n        ...PredictivePage\n      }\n      products {\n        ...PredictiveProduct\n      }\n      queries {\n        ...PredictiveQuery\n      }\n    }\n  }\n  #graphql\n  fragment PredictiveArticle on Article {\n    __typename\n    id\n    title\n    handle\n    blog {\n      handle\n    }\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictiveCollection on Collection {\n    __typename\n    id\n    title\n    handle\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictivePage on Page {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictiveProduct on Product {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      id\n      image {\n        url\n        altText\n        width\n        height\n      }\n      price {\n        amount\n        currencyCode\n      }\n    }\n  }\n\n  #graphql\n  fragment PredictiveQuery on SearchQuerySuggestion {\n    __typename\n    text\n    styledText\n    trackingParameters\n  }\n\n': {
    return: PredictiveSearchQuery;
    variables: PredictiveSearchQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
