import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * When the dev auth bypass is active, no backend is expected to be reachable.
 * This interceptor short-circuits every outgoing `/api/*` request with an empty
 * successful response so non-Dashboard pages do not spam the console with
 * network errors while the user (or Replit sandbox) browses the app.
 *
 * The Dashboard pages still get their real mock data from the React Query
 * cache seeded by [installQueryMocks.ts](./installQueryMocks.ts) — that cache
 * is consulted before the query function runs, so this interceptor never fires
 * for those specific query keys.
 */
export function installAxiosMocks(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Mark the request so the adapter can short-circuit it.
    (config as InternalAxiosRequestConfig & { adapter?: unknown }).adapter = async () => ({
      data: emptyResponseFor(config.url ?? ''),
      status: 200,
      statusText: 'OK (dev mock)',
      headers: {},
      config,
    });
    return config;
  });
}

function emptyResponseFor(url: string): unknown {
  // Permissions endpoint — must return a well-formed { role, permissions }
  // payload, otherwise the permissions store crashes when it does
  // `permissions.includes(policy)` on `undefined`. CompanyAdmin grants all.
  if (url.includes('/api/admin/role-permissions/my')) {
    return { role: 'CompanyAdmin', permissions: [] };
  }
  // Endpoints that return paginated collections — give them an empty page.
  if (
    url.includes('/api/fields') ||
    url.includes('/api/agro-operations') ||
    url.includes('/api/warehouses') ||
    url.includes('/api/cost-records') ||
    url.includes('/api/machines') ||
    url.includes('/api/employees') ||
    url.includes('/api/sales')
  ) {
    return { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 };
  }
  // Everything else — empty object / array works for the common shapes.
  return url.endsWith('s') ? [] : {};
}
