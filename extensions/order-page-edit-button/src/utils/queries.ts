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
          url
          altText
        }
      }
    }
  }
}
`;

// GraphQL query for searching products via Storefront API
export const SEARCH_PRODUCTS_QUERY = `
query SearchProducts($query: String!, $first: Int!) {
  products(first: $first, query: $query) {
    edges {
      node {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
              availableForSale
              image {
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