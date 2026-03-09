---
layout: default
title: API Reference
---

# 📡 API Reference

[← Назад на главную](.)

Все list-эндпоинты поддерживают пагинацию: `?page=1&pageSize=20`

Для всех запросов (кроме `/api/auth/*`) требуется:
- Заголовок `Authorization: Bearer <jwt-token>`
- Заголовок `X-Tenant-Id: <uuid>`

---

## 🔑 Аутентификация

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/auth/register` | Зарегистрироваться |
| POST | `/api/auth/login` | Получить JWT токен |

---

## 📦 Склад

| Метод | URL | Описание |
|-------|-----|----------|
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

---

## 🌾 Поля

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/fields` | Создать поле |
| GET | `/api/fields` | Список полей |
| GET | `/api/fields/{id}` | Карточка поля |
| PUT | `/api/fields/{id}` | Обновить поле |
| DELETE | `/api/fields/{id}` | Удалить поле |
| POST | `/api/fields/assign-crop` | Назначить культуру |
| PUT | `/api/fields/crop-history/{id}/yield` | Обновить урожайность |
| POST | `/api/fields/rotation-plans` | Планировать севооборот |
| DELETE | `/api/fields/rotation-plans/{id}` | Удалить план севооборота |

---

## ⚙️ Агрооперации

| Метод | URL | Описание |
|-------|-----|----------|
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

---

## 🚜 Техника

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/machinery` | Создать технику |
| GET | `/api/machinery` | Список техники |
| GET | `/api/machinery/summary` | Сводка по парку |
| GET | `/api/machinery/{id}` | Карточка техники |
| PUT | `/api/machinery/{id}` | Обновить технику |
| DELETE | `/api/machinery/{id}` | Удалить технику |
| POST | `/api/machinery/{id}/work-logs` | Записать наработку |
| POST | `/api/machinery/{id}/fuel-logs` | Записать заправку |

---

## 💰 Экономика

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/economics/cost-records` | Записать затрату |
| GET | `/api/economics/cost-records` | Список затрат |
| DELETE | `/api/economics/cost-records/{id}` | Удалить затрату |

---

## 📊 Аналитика

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/analytics/dashboard` | Сводный Dashboard |
| GET | `/api/analytics/resource-consumption` | Расход ресурсов |
| GET | `/api/analytics/field-efficiency` | Эффективность полей |

---

## ❤️ Health Checks

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe (проверка базы данных) |

---

## ⚙️ Конфигурация

| Переменная | Описание | Значение по умолчанию |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | см. docker-compose.yml |
| `JwtSettings__Key` | HMAC ключ подписи JWT (≥ 32 символа) | placeholder в docker-compose |
| `JwtSettings__Issuer` | Издатель JWT | `Agrotech` |
| `JwtSettings__Audience` | Аудитория JWT | `Agrotech` |
| `Cors__AllowedOrigins__0` | Разрешённый CORS origin | `http://localhost:3000` |
| `Swagger__Enabled` | Включить Swagger вне Development | `false` |
| `RateLimiting__ReadPermitLimit` | Лимит GET запросов / окно | `100` |
| `RateLimiting__WritePermitLimit` | Лимит POST/PUT/DELETE / окно | `30` |

> **Важно:** Замените `JwtSettings__Key` на надёжный секрет (≥ 32 символа) перед деплоем в любое общее окружение.

---

[← Назад на главную](.)
