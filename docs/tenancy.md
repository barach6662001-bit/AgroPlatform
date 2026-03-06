# Multi-Tenancy

AgroPlatform supports **multi-tenancy** with row-level data isolation per tenant.

---

## How it works

Every row in every domain table carries a `TenantId` column (UUID).
Entity Framework Core query filters automatically append `WHERE TenantId = @tenantId`
to every query so that tenants can never see each other's data.

The tenant is resolved from the `X-Tenant-Id` HTTP request header by
`TenantMiddleware` and injected into `AppDbContext` via `ITenantService`.

---

## Required header

All protected endpoints require the following header:

```
X-Tenant-Id: <tenant-uuid>
```

**Example:**

```
X-Tenant-Id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
```

If the header is missing or not a valid UUID, the middleware returns `400 Bad Request`.

---

## Tenant identity

The `TenantId` is supplied by the client on every request.
When registering a user (`POST /api/auth/register`), the desired tenant UUID
must be included in the request body — it becomes the user's default tenant.

---

## Swagger UI

To test multi-tenant endpoints in Swagger UI, add a global request header:

1. Open **Swagger UI** → click **Authorize** 🔒.
2. In the JWT Bearer field, paste your token.
3. Use the **Request Headers** field (or a browser extension such as
   *Modify Headers*) to add `X-Tenant-Id` to every request.

Alternatively, many REST clients (Postman, Insomnia, HTTPie) let you set
default headers per environment.

---

## Architecture notes

| Component | Role |
|-----------|------|
| `TenantMiddleware` | Reads `X-Tenant-Id` header, validates it, stores it in `HttpContext.Items` |
| `TenantService` | Retrieves the tenant ID from `IHttpContextAccessor` |
| `AppDbContext` | Injects `ITenantService`; applies `HasQueryFilter` for all auditable entities |
| `TenantInterceptor` | Sets `TenantId` automatically on new entities before they are saved |
