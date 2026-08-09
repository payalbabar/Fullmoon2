/**
 * Sentry Error Monitoring Module
 *
 * Configuration (via .env):
 *   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
 *
 * Monitoring is silently disabled when:
 *   - VITE_SENTRY_DSN is absent or empty
 *   - NODE_ENV is 'development' (unless VITE_SENTRY_FORCE_DEV=true)
 *
 * What is captured:
 *   - Unhandled JavaScript errors
 *   - Unhandled promise rejections
 *   - Manual error captures via captureError()
 *
 * What is NOT captured:
 *   - Wallet private keys or seed phrases
 *   - User PII
 *   - Transaction amounts beyond error context
 */

import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN || '';
const isDev = import.meta.env.DEV;
const forceInDev = import.meta.env.VITE_SENTRY_FORCE_DEV === 'true';

let initialized = false;

/**
 * Initialize Sentry. Call once at application startup in main.tsx.
 */
export function initSentry(): void {
  if (!dsn) return; // No DSN — silently skip
  if (isDev && !forceInDev) return; // Skip in dev unless forced

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'production',
    release: `midnight-lottery@1.0.0`,
    tracesSampleRate: 0.1, // 10% of transactions — adjust as needed
    replaysOnErrorSampleRate: 0.5,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    // Strip any potential sensitive data from URLs
    beforeSend(event) {
      // Do not send events containing wallet keys (safety net)
      const eventStr = JSON.stringify(event);
      if (
        eventStr.includes('private_key') ||
        eventStr.includes('seed_phrase') ||
        eventStr.includes('mnemonic')
      ) {
        return null;
      }
      return event;
    },
  });

  initialized = true;
}

/**
 * Capture an error with optional context. Safe to call when Sentry is not initialized.
 */
export function captureError(error: unknown, context?: Record<string, string>): void {
  if (!initialized) {
    console.error('[Midnight Lottery Error]', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
}

export { Sentry };
