# Order Edit Button Extension

This extension allows customers to edit their orders from the customer account, including the ability to add new products.

## Features

- Edit order item quantities
- Add new products to existing orders via search
- Clean, modular architecture

## Architecture

The extension has been refactored into a modular structure:

```
src/
├── types/
│   └── index.ts              # TypeScript interfaces
├── hooks/
│   ├── useOrderData.ts       # Hook for fetching and managing order data
│   └── useProductSearch.ts   # Hook for product search functionality
├── components/
│   ├── OrderItemsList.tsx    # Component for displaying order items
│   └── ProductSearchModal.tsx # Component for product search interface
├── utils/
│   └── queries.ts            # GraphQL queries
├── OrderEditModal.tsx        # Main modal component
└── OrderEditActionButton.tsx # Action button trigger
```

## Usage

1. The extension adds an "Edit Order" button in the customer account order actions menu
2. Clicking the button opens a modal where customers can:
   - Modify quantities of existing items
   - Click "Add Product" to search for and add new products
3. The product search modal:
   - Automatically displays initial products when opened
   - Features debounced search (500ms delay) as user types
   - No search button needed - search happens automatically
   - Shows up to 20 products at a time

## API Access

This extension requires:
- `api_access = true` - To query the Storefront API for product search
- Customer Account API access - To fetch order details

## Development

To test the extension locally:

```bash
npm run dev
```

## Prerequisites

Before you start building your extension, make sure that you've created a [development store](https://shopify.dev/docs/apps/tools/development-stores) with the [Checkout and Customer Accounts Extensibility](https://shopify.dev/docs/api/release-notes/developer-previews#previewing-new-features).

## Useful Links

- [Customer account UI extension documentation](https://shopify.dev/docs/api/customer-account-ui-extensions)
  - [Configuration](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/configuration)
  - [API Reference](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/apis)
  - [UI Components](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/components)
