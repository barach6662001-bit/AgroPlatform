/**
 * Dev-only auth bypass flag.
 *
 * Guarded by BOTH `import.meta.env.DEV` AND `VITE_BYPASS_AUTH === 'true'` so that
 * production builds physically cannot enable the bypass — the whole branch is
 * constant-folded to `false` by Vite and the mock modules are tree-shaken out.
 *
 * Usage: `if (isBypassEnabled) { ... }`
 */
export const isBypassEnabled: boolean =
  import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true';
