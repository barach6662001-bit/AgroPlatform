---
layout: default
title: AgroPlatform — Документация
---

# 🌾 AgroPlatform — Цифровая платформа управления агропредприятием

[![CI](https://github.com/barach6662001-bit/AgroPlatform/actions/workflows/ci.yml/badge.svg)](https://github.com/barach6662001-bit/AgroPlatform/actions/workflows/ci.yml)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/barach6662001-bit/AgroPlatform/blob/main/LICENSE)

**Комплексное решение** для управления складом, полями, агрооперациями, техникой, экономикой и аналитикой сельскохозяйственного предприятия.

---

## 📌 Навигация

| Раздел | Описание |
|--------|----------|
| [📡 API Reference](api) | Полный справочник по API эндпоинтам |
| [📐 Архитектура](architecture) | Обзор архитектуры проекта (Clean Architecture, CQRS) |
| [🚀 Деплой](deployment) | Руководство по развёртыванию (Docker Compose, TLS) |
| [🛠️ Разработка](development) | Руководство разработчика (локальный запуск, тесты) |

---

## ✨ Ключевые возможности

### 📦 Склад
Управление складами и товарами: приход, расход, перемещение между складами, инвентаризация, партийный учёт, остатки и история движений.

### 🌾 Поля
Карта полей с площадью и кадастровыми данными, учёт текущей культуры, история культур, урожайность, планирование севооборота.

### ⚙️ Агрооперации
Посев, удобрение, СЗР, обработка, уборка. Привязка ресурсов и техники к операциям. Автоматическое списание ресурсов со склада при завершении операции.

### 🚜 Техника
Управление парком техники, журнал наработки, учёт заправок, статусы (активна / в ремонте / списана), сводка по всему парку.

### 💰 Экономика
Учёт затрат по категориям с привязкой к полям и агрооперациям.

### 📊 Аналитика
Сводный Dashboard, расход ресурсов в разрезе периодов и полей, эффективность полей.

---

## 🛠️ Технологический стек

| Слой | Технологии |
|------|-----------|
| **Backend** | .NET 8, ASP.NET Core Web API, EF Core 8, PostgreSQL 16, MediatR, FluentValidation, Serilog, JWT, xUnit |
| **Frontend** | React 18, TypeScript, Vite, Ant Design 5, Zustand, Recharts, Leaflet |
| **Инфраструктура** | Docker, Docker Compose, GitHub Actions, Testcontainers |

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
npm install
npm run dev
# Фронтенд: http://localhost:3000
```

Подробнее о локальной разработке — в разделе [🛠️ Разработка](development).

---

## 🔐 Аутентификация в Swagger

1. `POST /api/auth/register` — зарегистрироваться
2. `POST /api/auth/login` — получить JWT токен
3. Нажать **Authorize** 🔒 → вставить токен (без `Bearer `)
4. Добавить заголовок `X-Tenant-Id: <uuid>` к запросам

---

## 📄 Лицензия

MIT — см. файл [LICENSE](https://github.com/barach6662001-bit/AgroPlatform/blob/main/LICENSE).
