// GraphQL query for fetching order details with status information
export const ORDER_STATUS_QUERY = `
query GetOrderStatus($orderId: ID!) {
  order(id: $orderId) {
    id
    financialStatus
    fulfillmentStatus
  }
}
`;
