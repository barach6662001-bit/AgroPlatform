---
layout: default
title: Архитектура
---

# 📐 Архитектура проекта

[← Назад на главную](.)

AgroPlatform построен на основе **Clean Architecture** с применением паттернов **CQRS** и **Multi-Tenancy**.

---

## 🗂️ Структура решения

```
src/
├── AgroPlatform.Api/            — Web API, контроллеры, middleware, Swagger
├── AgroPlatform.Application/    — CQRS handlers, DTOs, validators, пагинация
├── AgroPlatform.Domain/         — Доменные модели, enums
└── AgroPlatform.Infrastructure/ — EF Core, PostgreSQL, Identity, JWT, interceptors

frontend/
├── src/api/          — Axios клиент
├── src/components/   — UI компоненты
├── src/pages/        — Страницы модулей
├── src/stores/       — Zustand
└── src/types/        — TypeScript типы

tests/
├── AgroPlatform.UnitTests/
└── AgroPlatform.IntegrationTests/
```

---

## 🏛️ Слои бэкенда

### AgroPlatform.Domain
Самый внутренний слой — не зависит ни от чего.

- Доменные сущности (наследуют `BaseEntity` или `AuditableEntity`)
- Перечисления (enums)
- Интерфейсы домена

### AgroPlatform.Application
Слой бизнес-логики, зависит только от Domain.

- **CQRS**: команды (Commands) и запросы (Queries) через MediatR
- Обработчики (Handlers) для каждой команды/запроса
- DTO и маппинги
- Валидаторы (FluentValidation)
- Пагинация через `PagedList<T>`

### AgroPlatform.Infrastructure
Реализация инфраструктурных интерфейсов.

- **EF Core 8** с PostgreSQL 16 (`AppDbContext`)
- JWT аутентификация и авторизация
- Перехватчики (Interceptors): `TenantInterceptor`, `AuditInterceptor`
- `TenantService` — читает `TenantId` из `HttpContext.Items`
- `TenantMiddleware` — устанавливает `TenantId` из заголовка `X-Tenant-Id`

### AgroPlatform.Api
Точка входа в приложение.

- ASP.NET Core контроллеры
- Middleware пайплайн (аутентификация, tenant, rate limiting)
- Swagger / OpenAPI конфигурация
- Health checks

---

## 🔄 CQRS + MediatR

Каждая операция описывается как команда или запрос:

```
Request (Command/Query)
    ↓
MediatR Pipeline
    ↓ ValidationBehavior (FluentValidation)
    ↓
Handler
    ↓
Repository / DbContext
    ↓
Response (DTO)
```

Пример команды: `CreateWarehouseCommand → CreateWarehouseHandler → AppDbContext → WarehouseDto`

---

## 🏢 Multi-Tenancy

Платформа поддерживает **multi-tenancy** на уровне строк данных (Row-Level Security через EF Core Query Filters).

### Принцип работы:

1. Клиент отправляет заголовок `X-Tenant-Id: <uuid>`
2. `TenantMiddleware` записывает `TenantId` в `HttpContext.Items["TenantId"]`
3. `TenantService` читает `TenantId` из `HttpContext.Items`
4. `AppDbContext` захватывает `_tenantId` из `ITenantService` при конструировании
5. `OnModelCreating` применяет глобальный фильтр для всех `AuditableEntity`:
   ```csharp
   entity.HasQueryFilter(e => !e.IsDeleted && e.TenantId == _tenantId)
   ```

### Важные нюансы:

- `AppDbContext` захватывает `_tenantId` в момент создания (не лениво)
- При запросах к `/api/auth/*` (без заголовка) `_tenantId = Guid.Empty`
- `Tenant` наследует `BaseEntity` (не `AuditableEntity`), поэтому на него фильтр не распространяется
- При регистрации без заголовка `X-Tenant-Id` автоматически создаётся новый `Tenant`

---

## 🌐 Frontend

SPA на React 18 + TypeScript, взаимодействует с API через Axios.

### Ключевые библиотеки:

| Библиотека | Назначение |
|-----------|-----------|
| React 18 | UI фреймворк |
| TypeScript 5 | Типизация |
| Vite | Сборщик |
| Ant Design 5 | UI компоненты |
| Zustand | Управление состоянием |
| Recharts | Графики и аналитика |
| Leaflet | Карты полей |
| Axios | HTTP клиент |

### Маршрутизация (страницы):

- `/` — Dashboard (аналитика)
- `/warehouses` — Склад
- `/fields` — Поля
- `/agro-operations` — Агрооперации
- `/machinery` — Техника
- `/economics` — Экономика

---

## 🧪 Тестирование

### Юнит-тесты (`AgroPlatform.UnitTests`)
- Тестируют бизнес-логику Application слоя
- Используют Moq для мокирования зависимостей

### Интеграционные тесты (`AgroPlatform.IntegrationTests`)
- `CustomWebApplicationFactory` — использует InMemory базу данных
- `ApiFactory` — использует реальный PostgreSQL через **Testcontainers**
- `TestAuthHandler` — обходит JWT аутентификацию в тестах
- Оба фабричных класса применяют `PostConfigure<AuthenticationOptions>` для переопределения схемы аутентификации

---

[← Назад на главную](.)
