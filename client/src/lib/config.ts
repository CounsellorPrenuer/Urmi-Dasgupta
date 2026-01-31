/**
 * Centralized configuration for the client application.
 * 
 * VITE_API_BASE_URL logic:
 * HARDCODED fallback to production Worker URL to guarantee connectivity.
 */

export const config = {
    api: {
        // NUCLEAR OPTION: Directly hardcoded. No env var needed.
        baseUrl: "https://claryntia-worker.garyphadale.workers.dev"
    }
};
