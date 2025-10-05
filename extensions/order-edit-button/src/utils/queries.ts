// GraphQL query for fetching order details
export const ORDER_QUERY = `
query GetOrder($orderId: ID!) {
  order(id: $orderId) {
    id
    name
    createdAt
    financialStatus
    edited
    totalPrice {
      amount
      currencyCode
    }
    subtotal {
      amount
      currencyCode
    }
    totalTax {
      amount
      currencyCode
    }
    lineItems(first: 50) {
      nodes {
        id
        name
        title
        quantity
        variantId
        variantTitle
        price {
          amount
          currencyCode
        }
        totalPrice {
          amount
          currencyCode
        }
        image {
          url(transform: { maxWidth: 100, maxHeight: 100 })
          altText
        }
      }
    }
  }
}
`;

// GraphQL query for searching product variants via Storefront Predictive Search API
export const SEARCH_VARIANTS_QUERY = `
query SearchVariants($query: String!) {
  predictiveSearch(
    query: $query
    limit: 10
    limitScope: EACH
    searchableFields: [TITLE, PRODUCT_TYPE, VARIANTS_TITLE, VENDOR, VARIANTS_SKU]
    types: [PRODUCT]
    unavailableProducts: SHOW
  ) {
    products {
      id
      title
      featuredImage {
        url
        altText
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            image {
              url
              altText
            }
            sku
            product {
              id
              title
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
}
`;
