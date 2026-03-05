# 🌾 AgroPlatform

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Цифровая платформа управления агропредприятием**

Централизованная система для управления полями, складом, техникой, агрооперациями и экономикой сельскохозяйственного предприятия. Масштабируется от 1000 до 5000+ гектаров.

---

## 🖥️ Фронтенд

React 18 + TypeScript приложение находится в директории [`frontend/`](./frontend/).

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Подробнее — см. [frontend/README.md](./frontend/README.md).

---

## 🛠️ Технологический стек

| Технология | Назначение |
|------------|-----------|
| .NET 8 / ASP.NET Core Web API | Серверная платформа |
| PostgreSQL + Entity Framework Core 8 | База данных и ORM |
| Clean Architecture | Архитектурный паттерн (Domain → Application → Infrastructure → API) |
| MediatR | CQRS паттерн |
| FluentValidation | Валидация входных данных |
| Serilog | Структурированное логирование |
| ASP.NET Identity + JWT | Аутентификация и авторизация |
| Multi-tenant архитектура | Изоляция данных по TenantId |
| xUnit + FluentAssertions | Тестирование |
| Docker Compose | Контейнеризация PostgreSQL |

---

## 📐 Архитектура проекта

```
src/
├── AgroPlatform.Api/            — Web API, контроллеры, middleware
├── AgroPlatform.Application/    — Бизнес-логика, CQRS handlers, DTOs, validators
├── AgroPlatform.Domain/         — Доменные модели, enums, интерфейсы
└── AgroPlatform.Infrastructure/ — EF Core, PostgreSQL, Identity, конфигурации

tests/
├── AgroPlatform.UnitTests/        — Юнит-тесты
└── AgroPlatform.IntegrationTests/ — Интеграционные тесты
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

| Метод | URL | Описание |
|-------|-----|----------|
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

---

## 🚀 Быстрый старт

### Предварительные требования

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- PostgreSQL 15+
- Docker (опционально, для запуска PostgreSQL через Docker Compose)

### Шаги установки

1. **Клонировать репозиторий:**
   ```bash
   git clone https://github.com/barach6662001-bit/AgroPlatform.git
   cd AgroPlatform
   ```

2. **Запустить PostgreSQL** (или использовать Docker Compose):
   ```bash
   docker-compose up -d
   ```

3. **Настроить подключение к базе данных** в `src/AgroPlatform.Api/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=agroplatform;Username=postgres;Password=<YOUR_PASSWORD>"
     }
   }
   ```

4. **Применить миграции:**
   ```bash
   dotnet ef database update -p src/AgroPlatform.Infrastructure -s src/AgroPlatform.Api
   ```

5. **Запустить приложение:**
   ```bash
   dotnet run --project src/AgroPlatform.Api
   ```

6. **Открыть Swagger UI:**
   ```
   http://localhost:5000/swagger
   ```

---

## ⚙️ Конфигурация

Ключевые секции `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "<строка подключения к PostgreSQL>"
  },
  "Jwt": {
    "Key": "<секретный ключ>",
    "Issuer": "<издатель токена>",
    "Audience": "<аудитория токена>"
  },
  "Serilog": {
    "MinimumLevel": "Information"
  }
}
```

| Параметр | Описание |
|----------|----------|
| `ConnectionStrings:DefaultConnection` | Строка подключения к PostgreSQL |
| `Jwt:Key` | Секретный ключ для подписи JWT |
| `Jwt:Issuer` | Издатель JWT токена |
| `Jwt:Audience` | Аудитория JWT токена |
| `Serilog` | Конфигурация структурированного логирования |

---

## 🏢 Multi-Tenant

Платформа поддерживает мультиарендность с изоляцией данных на уровне базы данных:

- **Заголовок запроса:** `X-Tenant-Id`
- Все данные изолированы по `TenantId`
- Middleware автоматически применяет фильтрацию при каждом запросе

---

## 🧪 Тесты

```bash
# Запустить все тесты
dotnet test

# Только юнит-тесты
dotnet test tests/AgroPlatform.UnitTests

# Только интеграционные тесты
dotnet test tests/AgroPlatform.IntegrationTests
```

Стек тестирования:
- **xUnit** — фреймворк тестирования
- **FluentAssertions** — читаемые assertions
- **InMemory DB** — изоляция юнит-тестов
- **WebApplicationFactory** — интеграционные тесты

---

## 📄 Лицензия

MIT — см. файл [LICENSE](LICENSE).
