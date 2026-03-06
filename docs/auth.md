# Authentication

AgroPlatform uses **JWT Bearer** authentication.

---

## Overview

1. **Register** a user account — `POST /api/auth/register`
2. **Log in** — `POST /api/auth/login` to receive a JWT token
3. **Supply the token** in every subsequent request via the `Authorization` header

---

## Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Passw0rd!",
  "tenantId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

Returns a JWT token response on success.

---

## Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Passw0rd!"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-01-01T12:00:00Z"
}
```

---

## Using the token

Add an `Authorization` header to every protected request:

```
Authorization: Bearer <token>
```

### Swagger UI

1. Click the **Authorize** 🔒 button at the top right.
2. Paste only the token value (without `Bearer `).
3. Click **Authorize**, then **Close**.

All subsequent Swagger requests will include the header automatically.

---

## Token configuration

Configured under `JwtSettings` in `appsettings.json`:

| Key | Description |
|-----|-------------|
| `Key` | HMAC-SHA256 signing key — **minimum 32 characters** |
| `Issuer` | Expected `iss` claim |
| `Audience` | Expected `aud` claim |
| `ExpiresInMinutes` | Token lifetime (default: 60 minutes) |

Example (development only — never use in production):

```json
"JwtSettings": {
  "Key": "super-secret-key-for-development-minimum-32-characters-long!!",
  "Issuer": "AgroPlatform",
  "Audience": "AgroPlatform",
  "ExpiresInMinutes": 60
}
```

---

## Error responses

| Status | Meaning |
|--------|---------|
| `401 Unauthorized` | Token missing, expired or invalid |
| `403 Forbidden` | Token is valid but the user lacks permission |

All error responses follow the RFC 7807 **ProblemDetails** format:

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Unauthorized",
  "status": 401,
  "instance": "/api/fields"
}
```
