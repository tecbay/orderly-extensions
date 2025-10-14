# Deployment Guide

## Environment Configuration

This project uses environment variables to configure API endpoints dynamically during deployment without exposing sensitive configuration to merchants.

### Configuration File

All extensions use a shared configuration file located at:
- `extensions/shared/config.ts`

This file reads the `API_BASE_URL` environment variable during the build process.

### Environment Files

- `.env.local` - Local development configuration
- `.env.production` - Production configuration
- `.env.example` - Example configuration template

## Deployment Commands

### Local/Development Deployment

```
npm run deploy:local
```

This deploys with the local API URL: `https://orderly-be.test/api`

### Production Deployment

```bash
   npm run deploy:production
```

This deploys with the production API URL: `https://orderly.techlevin.com/api`

### Custom Deployment

You can also specify a custom API URL:

```bash
API_BASE_URL=https://your-custom-url.com/api npm run deploy
```

## Development

For local development, the default URL is used:

```bash
npm run dev
```

## How It Works

1. The `extensions/shared/config.ts` file exports a configuration object
2. All extensions import this shared config instead of hardcoding URLs
3. During deployment, the `API_BASE_URL` environment variable is passed to the build
4. The Shopify CLI build process replaces the environment variable with the actual value
5. The compiled extensions contain the correct API URL for the target environment

## Files Using Shared Config

- `extensions/customer-order-page/src/OrderEditPage.tsx`
- `extensions/customer-order-page/src/hooks/useSettings.ts`
- `extensions/order-edit-button/src/OrderEditActionButton.tsx`

## Security Notes

- API URLs are compiled into the extension at build time
- No sensitive information is exposed through the Shopify Extension Settings API
- Merchants cannot see or modify the API endpoint
- Different deployments can target different environments
