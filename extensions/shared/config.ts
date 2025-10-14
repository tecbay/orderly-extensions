/**
 * Shared configuration for all extensions
 * This value will be replaced during deployment based on environment
 *
 * To deploy with production URL:
 *   API_BASE_URL=https://orderly.techlevin.com/api npm run deploy
 *
 * For local development (default):
 *   npm run dev
 */

// @ts-ignore - This will be replaced at build time
const API_BASE_URL = process.env.API_BASE_URL ?? 'https://orderly-be.test/api';

console.log('API_BASE_URL', API_BASE_URL)
export const config = {
    API_BASE_URL,
} as const;
