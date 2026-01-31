/**
 * Centralized configuration for the client application.
 * 
 * VITE_API_BASE_URL logic:
 * 1. Checks import.meta.env.VITE_API_BASE_URL (Environment variable)
 * 2. Fallback to production Worker URL: "https://claryntia-worker.garyphadale.workers.dev"
 * 
 * This ensures the app works even if secrets are missed in CI/CD.
 */

export const config = {
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || "https://claryntia-worker.garyphadale.workers.dev"
    }
};
