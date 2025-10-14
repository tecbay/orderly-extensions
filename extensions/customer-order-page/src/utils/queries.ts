// GraphQL query for fetching order details with status information
export const ORDER_STATUS_QUERY = `
query GetOrderStatus($orderId: ID!) {
  order(id: $orderId) {
    id
    createdAt
    financialStatus
    fulfillmentStatus
  }
}
`;

// GraphQL query for fetching complete order details including line items
export const ORDER_DETAILS_QUERY = `
query GetOrderDetails($orderId: ID!) {
  order(id: $orderId) {
    id
    name
    createdAt
    updatedAt
    financialStatus
    fulfillmentStatus
    lineItems(first: 250) {
      edges {
        node {
          id
          title
          quantity
          refundableQuantity
          variantId
          variantTitle
          productId
          sku
          price {
            amount
            currencyCode
          }
          currentTotalPrice {
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
    subtotal {
      amount
      currencyCode
    }
    totalTax {
      amount
      currencyCode
    }
    totalPrice {
      amount
      currencyCode
    }
    totalShipping {
      amount
      currencyCode
    }
  }
}
`;
