---
layout: default
title: Разработка
---

# 🛠️ Руководство разработчика

[← Назад на главную](.)

---

## Требования

| Инструмент | Версия |
|-----------|--------|
| .NET SDK | 8.0+ |
| Node.js | 20+ |
| Docker | 24+ |
| Docker Compose | 2.x+ |
| PostgreSQL | 16 (через Docker) |

---

## Локальный запуск

### Вариант A — Docker Compose (все сервисы)

```bash
git clone https://github.com/barach6662001-bit/AgroPlatform.git
cd AgroPlatform
docker-compose up --build -d
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8080](http://localhost:8080)
- Swagger: [http://localhost:8080/swagger](http://localhost:8080/swagger)

### Вариант B — Бэкенд локально + PostgreSQL в Docker

```bash
# 1. Поднять только PostgreSQL
docker-compose up -d postgres

# 2. Применить миграции EF Core
dotnet ef database update \
  -p src/AgroPlatform.Infrastructure \
  -s src/AgroPlatform.Api

# 3. Запустить API
dotnet run --project src/AgroPlatform.Api
# API:     http://localhost:5224
# Swagger: http://localhost:5224/swagger
```

### Вариант C — Фронтенд отдельно

```bash
cd frontend

# Для разработки с локальным API (порт 5224):
# .env.development уже содержит VITE_API_URL=http://localhost:5224

# Для работы с Docker API (порт 8080):
echo "VITE_API_URL=http://localhost:8080" > .env.local

npm install
npm run dev
# http://localhost:3000
```

---

## Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости измените значения:

```bash
cp .env.example .env
```

---

## Миграции базы данных

### Создать новую миграцию

```bash
dotnet ef migrations add <НазваниеМиграции> \
  -p src/AgroPlatform.Infrastructure \
  -s src/AgroPlatform.Api
```

### Применить миграции

```bash
dotnet ef database update \
  -p src/AgroPlatform.Infrastructure \
  -s src/AgroPlatform.Api
```

### Откатить миграцию

```bash
dotnet ef database update <ПредыдущаяМиграция> \
  -p src/AgroPlatform.Infrastructure \
  -s src/AgroPlatform.Api
```

---

## Запуск тестов

### Все тесты

```bash
dotnet test
```

### Юнит-тесты

```bash
dotnet test tests/AgroPlatform.UnitTests
```

### Интеграционные тесты

> Требуется Docker (используются Testcontainers для PostgreSQL)

```bash
dotnet test tests/AgroPlatform.IntegrationTests
```

### С покрытием кода

```bash
dotnet test --collect:"XPlat Code Coverage"
```

---

## Сборка и публикация

### Сборка (Release)

```bash
dotnet build --configuration Release
```

### Публикация API

```bash
dotnet publish src/AgroPlatform.Api \
  --configuration Release \
  --output ./publish/api
```

### Запуск из артефакта

```bash
dotnet publish/api/AgroPlatform.Api.dll
```

---

## Разработка фронтенда

### Запуск в режиме разработки

```bash
cd frontend
npm run dev
```

### Линтинг

```bash
npm run lint
```

### Проверка типов TypeScript

```bash
npm run type-check
```

### Сборка для продакшена

```bash
npm run build
```

### Запуск тестов фронтенда

```bash
npm run test
```

---

## Структура проекта

```
src/
├── AgroPlatform.Api/
│   ├── Controllers/       — REST контроллеры по модулям
│   ├── Middleware/        — TenantMiddleware, ExceptionMiddleware
│   └── Program.cs         — Точка входа, DI конфигурация
│
├── AgroPlatform.Application/
│   ├── Auth/              — Команды регистрации и входа
│   ├── Warehouses/        — CQRS для склада
│   ├── Fields/            — CQRS для полей
│   ├── AgroOperations/    — CQRS для агроопераций
│   ├── Machinery/         — CQRS для техники
│   ├── Economics/         — CQRS для экономики
│   └── Analytics/         — Запросы аналитики
│
├── AgroPlatform.Domain/
│   ├── Users/             — User, Tenant сущности
│   ├── Warehouses/        — Warehouse, WarehouseItem, WarehouseMove
│   ├── Fields/            — Field, CropHistory, RotationPlan
│   ├── AgroOperations/    — AgroOperation, OperationResource, OperationMachinery
│   ├── Machinery/         — Machinery, WorkLog, FuelLog
│   └── Economics/         — CostRecord
│
└── AgroPlatform.Infrastructure/
    ├── Persistence/
    │   ├── AppDbContext.cs
    │   ├── Configurations/ — EF Core entity configurations
    │   └── Interceptors/   — TenantInterceptor, AuditInterceptor
    └── Services/           — TenantService, JwtTokenService

frontend/src/
├── api/           — Axios клиент и методы API
├── components/    — Переиспользуемые UI компоненты
├── pages/         — Страницы (Dashboard, Warehouses, Fields, ...)
├── stores/        — Zustand stores
└── types/         — TypeScript типы и интерфейсы
```

---

## Соглашения о коде

- Backend следует **Clean Architecture**: зависимости направлены внутрь (Domain ← Application ← Infrastructure ← Api)
- CQRS через **MediatR**: каждая операция — отдельная команда или запрос
- **FluentValidation** для валидации входных данных
- **Serilog** для структурированного логирования
- Все сущности с поддержкой tenancy наследуют `AuditableEntity`
- Soft delete: удалённые записи помечаются флагом `IsDeleted = true`

---

## Внесение вклада

Смотрите [CONTRIBUTING.md](https://github.com/barach6662001-bit/AgroPlatform/blob/main/CONTRIBUTING.md) для получения информации о:
- Workflow с ветками
- Требованиях к PR
- Проверках CI
- Соглашениях о коммитах
- Руководстве по code review

---

[← Назад на главную](.)
