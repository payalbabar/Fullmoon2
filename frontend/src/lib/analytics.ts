/**
 * Analytics Module — Plausible-compatible lightweight event tracking
 *
 * Configuration (via .env):
 *   VITE_ANALYTICS_ENABLED=true
 *   VITE_ANALYTICS_DOMAIN=yourdomain.com
 *
 * Events are silently dropped when:
 *   - VITE_ANALYTICS_ENABLED is false or absent
 *   - Plausible script is not loaded
 *   - Any error occurs (never breaks the app)
 *
 * Privacy: No PII, no wallet private keys, no seed phrases collected.
 */

const isEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const domain = import.meta.env.VITE_ANALYTICS_DOMAIN || '';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export type AnalyticsEvent =
  | 'app_open'
  | 'wallet_connect_started'
  | 'wallet_connected'
  | 'wallet_connection_failed'
  | 'wallet_disconnected'
  | 'lottery_viewed'
  | 'lottery_entry_started'
  | 'lottery_entry_submitted'
  | 'lottery_entry_confirmed'
  | 'draw_winner_submitted'
  | 'draw_winner_confirmed'
  | 'claim_prize_started'
  | 'claim_prize_confirmed'
  | 'transaction_failed'
  | 'indexer_synced'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'feedback_opened'
  | 'feedback_submitted';

export interface EventProps {
  [key: string]: string | number | boolean | undefined;
  wallet_name?: string;
  network?: string;
  error_type?: string;
  ticket_count?: number;
  round_id?: number;
  step?: number;
  category?: string;
}

/**
 * Track a product analytics event.
 * Safe to call even when analytics is disabled — it becomes a no-op.
 */
export function trackEvent(event: AnalyticsEvent, props?: EventProps): void {
  if (!isEnabled) return;

  // Strip undefined values so props satisfies Record<string, string | number | boolean>
  const cleanProps = props
    ? Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as Record<string, string | number | boolean>
    : undefined;

  try {
    if (typeof window.plausible === 'function') {
      // Use Plausible's native API
      window.plausible(event, cleanProps ? { props: cleanProps } : undefined);
    } else {
      // Fallback: beacon API for minimal tracking (if no Plausible)
      if (navigator.sendBeacon && domain) {
        const payload = JSON.stringify({ event, props, domain, url: window.location.href });
        navigator.sendBeacon(`https://plausible.io/api/event`, new Blob([payload], { type: 'application/json' }));
      }
    }
  } catch {
    // Analytics must never break the app
  }
}

/**
 * Track page views (called once on app open)
 */
export function trackPageView(): void {
  trackEvent('app_open');
}
