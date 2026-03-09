# 🌾 AgroPlatform

[![CI](https://github.com/barach6662001-bit/AgroPlatform/actions/workflows/ci.yml/badge.svg)](https://github.com/barach6662001-bit/AgroPlatform/actions/workflows/ci.yml)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Keywords / Topics:**
`agriculture` `agro` `farm-management` `erp` `agritech`
`dotnet` `aspnet-core` `entity-framework-core` `clean-architecture` `cqrs` `postgresql`
`react` `typescript` `ant-design` `vite` `zustand` `leaflet`
`docker` `jwt-authentication` `multi-tenant`

**Цифровая платформа управления агропредприятием** — комплексное решение для управления складом, полями, агрооперациями, техникой, экономикой и аналитикой сельскохозяйственного предприятия.

---

## 🚀 Быстрый старт

### Вариант A — Docker Compose (рекомендуется)

```bash
git clone https://github.com/barach6662001-bit/AgroPlatform.git
cd AgroPlatform
docker-compose up --build -d
# Frontend: http://localhost:3000
# API:      http://localhost:8080
# Swagger:  http://localhost:8080/swagger
```

> **Примечание:** Frontend запускается на порту 3000. API-запросы (`/api/*`) автоматически проксируются через Nginx к бэкенду (`api:8080`) внутри Docker-сети.

### Вариант B — Локальный .NET + Docker PostgreSQL

```bash
# 1. Поднять только PostgreSQL
docker-compose up -d postgres

# 2. Применить миграции
dotnet ef database update -p src/AgroPlatform.Infrastructure -s src/AgroPlatform.Api

# 3. Запустить API
dotnet run --project src/AgroPlatform.Api
# API:     http://localhost:5224
# Swagger: http://localhost:5224/swagger
```

### Вариант C — Фронтенд (отдельно)

```bash
cd frontend
# .env.development уже содержит VITE_API_URL=http://localhost:5224 для локальной разработки.
# Для работы с Docker (API на порту 8080) создайте файл frontend/.env.local:
#   VITE_API_URL=http://localhost:8080
npm install
npm run dev
# Фронтенд: http://localhost:3000
```

---

## 🔐 Аутентификация в Swagger

1. `POST /api/auth/register` — зарегистрироваться
2. `POST /api/auth/login` — получить JWT токен
3. Нажать **Authorize** 🔒 → вставить токен (без `Bearer `)
4. Добавить заголовок `X-Tenant-Id: <uuid>` к запросам (подробнее — [docs/tenancy.md](docs/tenancy.md))

---

## ⚙️ Конфигурация

| Переменная | Описание | Значение по умолчанию |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | см. docker-compose.yml |
| `JwtSettings__Key` | HMAC ключ подписи JWT (≥ 32 символа) | placeholder в docker-compose |
| `JwtSettings__Issuer` | Издатель JWT | `AgroPlatform` |
| `JwtSettings__Audience` | Аудитория JWT | `AgroPlatform` |
| `Cors__AllowedOrigins__0` | Разрешённый CORS origin | `http://localhost:3000` |
| `Swagger__Enabled` | Включить Swagger вне Development | `false` |
| `RateLimiting__ReadPermitLimit` | Лимит GET запросов / окно | `100` |
| `RateLimiting__WritePermitLimit` | Лимит POST/PUT/DELETE / окно | `30` |

> **Важно:** Замените `JwtSettings__Key` на надёжный секрет (≥ 32 символа) перед деплоем в любое общее окружение.

---

## 🛠️ Технологический стек

| Слой | Технологии |
|------|-----------|
| **Backend** | .NET 8, ASP.NET Core Web API, EF Core 8, PostgreSQL 16, MediatR, FluentValidation, Serilog, JWT, xUnit |
| **Frontend** | React 18, TypeScript, Vite, Ant Design 5, Zustand, Recharts, Leaflet |
| **Инфраструктура** | Docker, Docker Compose, GitHub Actions, Testcontainers |

---

## 📐 Архитектура проекта

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

## 📦 Модули системы

### 📦 Склад (`api/warehouses`)
Управление складами и товарами: приход, расход, перемещение между складами, инвентаризация, партийный учёт, остатки и история движений.

### 🌾 Поля (`api/fields`)
Карта полей с площадью и кадастровыми данными, учёт текущей культуры, история культур, урожайность, планирование севооборота.

### ⚙️ Агрооперации (`api/agro-operations`)
Посев, удобрение, СЗР, обработка, уборка. Привязка ресурсов и техники к операциям. Автоматическое списание ресурсов со склада при завершении операции.

### 🚜 Техника (`api/machinery`)
Управление парком техники, журнал наработки, учёт заправок, статусы (активна / в ремонте / списана), сводка по всему парку.

### 💰 Экономика (`api/economics`)
Учёт затрат по категориям с привязкой к полям и агрооперациям.

### 📊 Аналитика (`api/analytics`)
Сводный Dashboard, расход ресурсов в разрезе периодов и полей, эффективность полей.

---

## 🌐 API Endpoints

> Все list-эндпоинты поддерживают пагинацию: `?page=1&pageSize=20`

| Метод | URL | Описание |
|-------|-----|----------|
| **🔑 Аутентификация** | | |
| POST | `/api/auth/register` | Зарегистрироваться |
| POST | `/api/auth/login` | Получить JWT токен |
| **📦 Склад** | | |
| POST | `/api/warehouses` | Создать склад |
| GET | `/api/warehouses` | Список складов |
| POST | `/api/warehouses/items` | Создать товар |
| GET | `/api/warehouses/items` | Список товаров |
| POST | `/api/warehouses/receipt` | Приход на склад |
| POST | `/api/warehouses/issue` | Расход со склада |
| POST | `/api/warehouses/transfer` | Перемещение между складами |
| POST | `/api/warehouses/inventory` | Инвентаризация |
| GET | `/api/warehouses/balances` | Остатки |
| GET | `/api/warehouses/moves` | История движений |
| **🌾 Поля** | | |
| POST | `/api/fields` | Создать поле |
| GET | `/api/fields` | Список полей |
| GET | `/api/fields/{id}` | Карточка поля |
| PUT | `/api/fields/{id}` | Обновить поле |
| DELETE | `/api/fields/{id}` | Удалить поле |
| POST | `/api/fields/assign-crop` | Назначить культуру |
| PUT | `/api/fields/crop-history/{id}/yield` | Обновить урожайность |
| POST | `/api/fields/rotation-plans` | Планировать севооборот |
| DELETE | `/api/fields/rotation-plans/{id}` | Удалить план севооборота |
| **⚙️ Агрооперации** | | |
| POST | `/api/agro-operations` | Создать операцию |
| GET | `/api/agro-operations` | Список операций |
| GET | `/api/agro-operations/{id}` | Карточка операции |
| PUT | `/api/agro-operations/{id}` | Обновить операцию |
| POST | `/api/agro-operations/{id}/complete` | Завершить операцию |
| DELETE | `/api/agro-operations/{id}` | Удалить операцию |
| POST | `/api/agro-operations/{id}/resources` | Добавить ресурс |
| PUT | `/api/agro-operations/resources/{id}/actual` | Обновить факт расхода ресурса |
| DELETE | `/api/agro-operations/resources/{id}` | Убрать ресурс |
| POST | `/api/agro-operations/{id}/machinery` | Привязать технику |
| PUT | `/api/agro-operations/machinery/{id}` | Обновить технику операции |
| DELETE | `/api/agro-operations/machinery/{id}` | Убрать технику из операции |
| **🚜 Техника** | | |
| POST | `/api/machinery` | Создать технику |
| GET | `/api/machinery` | Список техники |
| GET | `/api/machinery/summary` | Сводка по парку |
| GET | `/api/machinery/{id}` | Карточка техники |
| PUT | `/api/machinery/{id}` | Обновить технику |
| DELETE | `/api/machinery/{id}` | Удалить технику |
| POST | `/api/machinery/{id}/work-logs` | Записать наработку |
| POST | `/api/machinery/{id}/fuel-logs` | Записать заправку |
| **💰 Экономика** | | |
| POST | `/api/economics/cost-records` | Записать затрату |
| GET | `/api/economics/cost-records` | Список затрат |
| DELETE | `/api/economics/cost-records/{id}` | Удалить затрату |
| **📊 Аналитика** | | |
| GET | `/api/analytics/dashboard` | Сводный Dashboard |
| GET | `/api/analytics/resource-consumption` | Расход ресурсов |
| GET | `/api/analytics/field-efficiency` | Эффективность полей |
| **❤️ Health Checks** | | |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe (проверка базы данных) |

---

## 🧪 Тесты

```bash
dotnet test                                       # все тесты
dotnet test tests/AgroPlatform.UnitTests          # unit
dotnet test tests/AgroPlatform.IntegrationTests   # integration (нужен Docker)
```

---

## 🔧 Сборка и публикация

```bash
# Сборка (Release)
dotnet build --configuration Release

# Публикация API
dotnet publish src/AgroPlatform.Api --configuration Release --output ./publish/api

# Запустить из артефакта
dotnet publish/api/AgroPlatform.Api.dll
```

---

## 🤖 CI/CD

GitHub Actions автоматически запускается на каждый push в `main` и на каждый Pull Request:

| Шаг | Описание |
|-----|----------|
| Restore | Восстановление NuGet зависимостей (с кешем) |
| Build | Сборка всего решения в конфигурации Release |
| Warn-as-error | Строгая проверка предупреждений в Domain и Application |
| Unit tests | Юнит-тесты с покрытием кода (Cobertura XML) |
| Integration tests | Интеграционные тесты (Testcontainers + PostgreSQL) |
| Artifacts | Загрузка результатов тестов, покрытия и API-артефакта |
| Vulnerability scan | `dotnet list package --vulnerable` (не критичный шаг) |

Артефакты сборки хранятся 7 дней и доступны на вкладке **Actions → Artifacts**.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch workflow, PR requirements, CI checks, commit conventions, and code review guidelines.

For repository admins: branch protection setup instructions are in [docs/branch-protection.md](docs/branch-protection.md).

---

## 📄 Лицензия

MIT — см. файл [LICENSE](LICENSE).
