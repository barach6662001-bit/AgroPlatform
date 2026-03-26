# 🌾 AgroPlatform

[![CI](https://github.com/barach6662001-bit/AgroPlatform/actions/workflows/ci.yml/badge.svg)](https://github.com/barach6662001-bit/AgroPlatform/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue?logo=github)](https://barach6662001-bit.github.io/AgroPlatform/)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Цифрова платформа управління агропідприємством** — комплексне рішення для обліку складу, полів, агрооперацій, техніки, економіки та аналітики сільськогосподарського підприємства.

---

## Зміст

- [Можливості](#-можливості)
- [Технологічний стек](#-технологічний-стек)
- [Архітектура](#-архітектура)
- [Швидкий старт](#-швидкий-старт)
- [Конфігурація](#-конфігурація)
- [API](#-api)
- [Тести](#-тести)
- [CI/CD](#-cicd)
- [Документація](#-документація)
- [Contributing](#-contributing)
- [Ліцензія](#-ліцензія)

---

## ✅ Можливості

| Модуль | Опис |
|--------|------|
| **Склад** | Склади та товари, прихід / витрата / переміщення, інвентаризація, партійний облік (FIFO/FEFO), залишки та історія рухів |
| **Поля** | Карта полів з площею та кадастровими даними, поточна культура, історія культур, урожайність, планування сівозміни |
| **Агрооперації** | Посів, удобрення, ЗЗР, обробіток, збирання. Прив'язка ресурсів і техніки, автоматичне списання ресурсів при завершенні операції |
| **Техніка** | Парк техніки, журнал наробітку, облік заправок, статуси (активна / в ремонті / списана), зведена картка |
| **Економіка** | Облік витрат по категоріях із прив'язкою до полів та агрооперацій. Від'ємна сума = дохід |
| **Аналітика** | Зведений Dashboard, витрата ресурсів у розрізі дат і полів, ефективність полів |
| **HR** | Персонал, посади, норми виходу, облік відпрацьованого часу |
| **Зерносховище** | Облік прийому, відвантаження та залишків зерна по культурах |
| **Продажі** | Реестр угод, покупці, відвантаження із зерносховища |

---

## 🛠️ Технологічний стек

| Шар | Технології |
|-----|-----------|
| **Backend** | .NET 8, ASP.NET Core Web API, EF Core 8, PostgreSQL 16 + PostGIS, MediatR, FluentValidation, Serilog, JWT |
| **Frontend** | React 18, TypeScript, Vite, Ant Design 5, Zustand, React Query, Recharts, Leaflet |
| **Тести** | xUnit, Testcontainers, Moq |
| **Інфраструктура** | Docker, Docker Compose, GitHub Actions, Nginx, Let's Encrypt |

---

## 📐 Архітектура

Проект побудований за принципами **Clean Architecture** з підходом **CQRS + MediatR**:

```
src/
├── AgroPlatform.Domain/         — Доменні сутності, enum-и
├── AgroPlatform.Application/    — CQRS команди / запити, DTO, валідатори, інтерфейси
├── AgroPlatform.Infrastructure/ — EF Core, PostgreSQL, Identity, JWT, перехоплювачі
└── AgroPlatform.Api/            — Контролери, middleware, Swagger, SignalR Hubs

frontend/
├── src/api/          — Axios + React Query клієнт
├── src/components/   — Спільні UI-компоненти
├── src/pages/        — Сторінки модулів
├── src/stores/       — Zustand стани
├── src/types/        — TypeScript інтерфейси
└── src/i18n/         — Локалізація (uk.ts, en.ts)

tests/
├── AgroPlatform.UnitTests/        — Юніт-тести
└── AgroPlatform.IntegrationTests/ — Інтеграційні тести (Testcontainers)
```

**Ключові паттерни:**
- Всі сутності наслідують `AuditableEntity` (`TenantId`, `IsDeleted`, `CreatedAtUtc`, `UpdatedAtUtc`)
- Мультиорендність через заголовок `X-Tenant-Id`
- М'яке видалення через прапор `IsDeleted`
- Оптимістичне блокування через `RowVersion` на `StockBalance`

---

## 🚀 Швидкий старт

### Варіант A — Docker Compose (рекомендується)

```bash
git clone https://github.com/barach6662001-bit/AgroPlatform.git
cd AgroPlatform
docker-compose up --build -d
```

| Сервіс | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger |

Міграції та seed-дані застосовуються автоматично при першому запуску (`AUTO_MIGRATE=true`).

---

### 🎯 Demo-доступ

Після першого запуску база заповнюється демо-даними:

| | |
|-|-|
| **Email** | `demo@agro.local` |
| **Пароль** | `DemoPass1` |

На сторінці входу є кнопка **«Увійти як Demo»** для одноклікового входу.

**Demo-середовище містить:**
- Tenant «Агро-Демо ТОВ» (TenantId фіксований — `aaaaaaaa-0000-...`)
- 2 склади з початковими залишками (насіння пшениці, гербіцид, ДП)
- 3 поля (Захід 42.5 га — пшениця, Схід 38 га — соняшник, Північ 55 га — кукурудза)
- 2 одиниці техніки (John Deere 8R 310, Claas Lexion 770)

> Демо-дані seed-яться один раз ідемпотентно. Перезапуск контейнерів не дублює дані.

---

### Варіант B — Локальний .NET + Docker PostgreSQL

```bash
# 1. Підняти тільки PostgreSQL
docker-compose up -d postgres

# 2. Застосувати міграції
dotnet ef database update \
  --project src/AgroPlatform.Infrastructure \
  --startup-project src/AgroPlatform.Api

# 3. Запустити API
dotnet run --project src/AgroPlatform.Api
# API:     http://localhost:5224
# Swagger: http://localhost:5224/swagger
```

---

### Варіант C — Frontend окремо

```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:3000
```

> За замовчуванням `vite.config.ts` проксує `/api` на `http://localhost:8080`.  
> Для локального .NET (порт 5224) додайте `frontend/.env.development.local`:
> ```
> VITE_API_URL=http://localhost:5224
> ```

---

## 🔐 Аутентифікація в Swagger

1. `POST /api/auth/register` — зареєструватися
2. `POST /api/auth/login` — отримати JWT-токен
3. Натиснути **Authorize** 🔒 → вставити токен (без `Bearer `)
4. Додати заголовок `X-Tenant-Id: <uuid>` до запитів (детальніше — [docs/tenancy.md](docs/tenancy.md))

---

## ⚙️ Конфігурація

| Змінна | Опис | За замовчуванням |
|--------|------|-----------------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | див. docker-compose.yml |
| `JwtSettings__Key` | HMAC ключ підпису JWT (≥ 32 символи) | placeholder у docker-compose |
| `JwtSettings__Issuer` | Видавець JWT | `Agrotech` |
| `JwtSettings__Audience` | Аудиторія JWT | `Agrotech` |
| `Cors__AllowedOrigins__0` | Дозволений CORS origin | `http://localhost:3000` |
| `Swagger__Enabled` | Увімкнути Swagger поза Development | `false` |
| `AUTO_MIGRATE` | Автоматично застосовувати міграції при старті | `false` |
| `RateLimiting__ReadPermitLimit` | Ліміт GET-запитів / вікно | `100` |
| `RateLimiting__WritePermitLimit` | Ліміт POST/PUT/DELETE / вікно | `30` |

> **Важливо:** Замініть `JwtSettings__Key` на надійний секрет (≥ 32 символи) перед деплоєм.

Зразок файлу конфігурації: [`.env.example`](.env.example)

---

## 🌐 API

> Всі list-ендпоінти підтримують пагінацію: `?page=1&pageSize=20`

<details>
<summary>Показати повну таблицю ендпоінтів</summary>

| Метод | URL | Опис |
|-------|-----|------|
| **Аутентифікація** | | |
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Отримати JWT-токен |
| **Склад** | | |
| POST | `/api/warehouses` | Створити склад |
| GET | `/api/warehouses` | Список складів |
| POST | `/api/warehouses/items` | Створити товар |
| GET | `/api/warehouses/items` | Список товарів |
| POST | `/api/warehouses/receipt` | Прихід на склад |
| POST | `/api/warehouses/issue` | Витрата зі складу |
| POST | `/api/warehouses/transfer` | Переміщення між складами |
| POST | `/api/warehouses/inventory` | Інвентаризація |
| GET | `/api/warehouses/balances` | Залишки |
| GET | `/api/warehouses/moves` | Історія рухів |
| **Поля** | | |
| POST | `/api/fields` | Створити поле |
| GET | `/api/fields` | Список полів |
| GET | `/api/fields/{id}` | Картка поля |
| PUT | `/api/fields/{id}` | Оновити поле |
| DELETE | `/api/fields/{id}` | Видалити поле |
| POST | `/api/fields/assign-crop` | Призначити культуру |
| PUT | `/api/fields/crop-history/{id}/yield` | Оновити врожайність |
| POST | `/api/fields/rotation-plans` | Планувати сівозміну |
| DELETE | `/api/fields/rotation-plans/{id}` | Видалити план сівозміни |
| **Агрооперації** | | |
| POST | `/api/agro-operations` | Створити операцію |
| GET | `/api/agro-operations` | Список операцій |
| GET | `/api/agro-operations/{id}` | Картка операції |
| PUT | `/api/agro-operations/{id}` | Оновити операцію |
| POST | `/api/agro-operations/{id}/complete` | Завершити операцію |
| DELETE | `/api/agro-operations/{id}` | Видалити операцію |
| POST | `/api/agro-operations/{id}/resources` | Додати ресурс |
| PUT | `/api/agro-operations/resources/{id}/actual` | Оновити факт витрати ресурсу |
| DELETE | `/api/agro-operations/resources/{id}` | Прибрати ресурс |
| POST | `/api/agro-operations/{id}/machinery` | Прив'язати техніку |
| PUT | `/api/agro-operations/machinery/{id}` | Оновити техніку операції |
| DELETE | `/api/agro-operations/machinery/{id}` | Прибрати техніку з операції |
| **Техніка** | | |
| POST | `/api/machinery` | Створити техніку |
| GET | `/api/machinery` | Список техніки |
| GET | `/api/machinery/summary` | Зведення по парку |
| GET | `/api/machinery/{id}` | Картка техніки |
| PUT | `/api/machinery/{id}` | Оновити техніку |
| DELETE | `/api/machinery/{id}` | Видалити техніку |
| POST | `/api/machinery/{id}/work-logs` | Записати наробіток |
| POST | `/api/machinery/{id}/fuel-logs` | Записати заправку |
| **Економіка** | | |
| POST | `/api/economics/cost-records` | Записати витрату |
| GET | `/api/economics/cost-records` | Список витрат |
| DELETE | `/api/economics/cost-records/{id}` | Видалити витрату |
| **Аналітика** | | |
| GET | `/api/analytics/dashboard` | Зведений Dashboard |
| GET | `/api/analytics/resource-consumption` | Витрата ресурсів |
| GET | `/api/analytics/field-efficiency` | Ефективність полів |
| **Health Checks** | | |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe (перевіряє БД) |

</details>

Повна інтерактивна документація: **Swagger UI** за адресою `/swagger` (увімкнено в Development та Docker).

---

## 🧪 Тести

```bash
# Всі тести
dotnet test

# Тільки юніт-тести
dotnet test tests/AgroPlatform.UnitTests

# Тільки інтеграційні (потрібен Docker)
dotnet test tests/AgroPlatform.IntegrationTests
```

---

## 🔧 Збірка

```bash
# Backend
dotnet build --configuration Release

# Frontend (type-check)
cd frontend && npx tsc --noEmit

# Публікація API
dotnet publish src/AgroPlatform.Api --configuration Release --output ./publish/api
```

---

## 🤖 CI/CD

GitHub Actions запускається на кожен push до `main` та на кожен Pull Request:

| Крок | Опис |
|------|------|
| Restore | Відновлення NuGet-залежностей (з кешем) |
| Build | Збірка всього рішення в конфігурації Release |
| Backend tests | Юніт + інтеграційні тести (Testcontainers) |
| Frontend tests | Vitest, ESLint, TypeScript type-check, Docker build dry-run |
| Lockfile guard | Перевірка синхронізації `package-lock.json` з `package.json` |
| Vulnerability scan | `dotnet list package --vulnerable` |
| Artifacts | Результати тестів, покриття коду, API-артефакт (7 днів) |

**CD:** workflow `Deploy to Production` публікує Docker-образи до GitHub Container Registry (`ghcr.io`) та запускає деплой через ручний тригер з підтвердженням через GitHub Environment `production`.

---

## 📦 Production Secrets

Для деплою в продакшен налаштуйте **GitHub Secrets** у **Settings → Secrets and variables → Actions**:

| Секрет | Опис |
|--------|------|
| `POSTGRES_PASSWORD` | Пароль бази даних PostgreSQL |
| `JWT_KEY` | Ключ підпису JWT (мінімум 32 символи) |
| `DOMAIN` | Домен для TLS-сертифіката (Let's Encrypt) |
| `EMAIL` | Email для реєстрації в Let's Encrypt |
| `CORS_ORIGIN` | URL фронтенда, дозволений CORS-політикою |

Детально: [docs/production-secrets.md](docs/production-secrets.md)

---

## 📖 Документація

Повна документація: **[barach6662001-bit.github.io/AgroPlatform](https://barach6662001-bit.github.io/AgroPlatform/)**

| Документ | Опис |
|----------|------|
| [docs/api.md](docs/api.md) | Довідник по API |
| [docs/architecture.md](docs/architecture.md) | Архітектурні рішення |
| [docs/auth.md](docs/auth.md) | Аутентифікація та авторизація |
| [docs/tenancy.md](docs/tenancy.md) | Мультиорендність |
| [docs/deployment.md](docs/deployment.md) | Керівництво по деплою |
| [docs/development.md](docs/development.md) | Налаштування середовища розробки |
| [docs/local-development.md](docs/local-development.md) | Локальна розробка в Codespace |
| [docs/backup-restore.md](docs/backup-restore.md) | Резервне копіювання та відновлення |
| [docs/production-secrets.md](docs/production-secrets.md) | Секрети для продакшену |
| [docs/branch-protection.md](docs/branch-protection.md) | Захист гілок |

---

## 🤝 Contributing

Дивись [CONTRIBUTING.md](CONTRIBUTING.md) — workflow гілок, вимоги до PR, CI-перевірки, конвенції коміт-повідомлень.

Автоматичне очищення гілок:
- при злитті PR — гілка видаляється автоматично
- щотижня (неділя, 03:00 UTC) — видаляються залишені злиті гілки

---

## 📄 Ліцензія

MIT — див. [LICENSE](LICENSE).
