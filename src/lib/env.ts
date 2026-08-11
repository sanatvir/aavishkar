/** Demo seed runs only when explicitly enabled (local demos). Off by default for production. */
export const isDemoSeedEnabled = import.meta.env.VITE_ENABLE_DEMO_SEED === "true";
