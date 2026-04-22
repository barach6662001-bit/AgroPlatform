/**
 * Public demo mode — when enabled, the site auto-logs in as the demo
 * user on first load so that visitors see the full app without any
 * login screen. This is a **production-safe** flag (unlike
 * {@link import('../mocks/isBypassEnabled').isBypassEnabled} which is
 * DEV-only) and is gated purely on a build-time env var.
 *
 * Toggle:
 *   • Set `VITE_PUBLIC_DEMO_MODE=true` in the frontend Dockerfile build-arg
 *     (or `.env.production`) and rebuild → demo mode ON.
 *   • Set `VITE_PUBLIC_DEMO_MODE=false` (or unset) and rebuild → demo mode OFF,
 *     normal login flow restored.
 *
 * Credentials come from the seeded demo user in `DataSeeder.cs`
 * (`demo@agro.local` / `DemoPass1`). They can be overridden via
 * `VITE_PUBLIC_DEMO_EMAIL` / `VITE_PUBLIC_DEMO_PASSWORD` at build time.
 *
 * NOTE: because Vite inlines these values into the client bundle at build
 * time, the password becomes publicly visible in the JS. This is an
 * accepted trade-off — the whole point of demo mode is that the site is
 * publicly open, so the creds are effectively public already.
 */

export const isPublicDemoMode: boolean =
  import.meta.env.VITE_PUBLIC_DEMO_MODE === 'true';

export const publicDemoEmail: string =
  (import.meta.env.VITE_PUBLIC_DEMO_EMAIL as string | undefined) ?? 'demo@agro.local';

export const publicDemoPassword: string =
  (import.meta.env.VITE_PUBLIC_DEMO_PASSWORD as string | undefined) ?? 'DemoPass1';
