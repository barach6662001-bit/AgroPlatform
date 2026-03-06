# 🌾 АгроПлатформа — Фронтенд

React 18 + TypeScript + Vite додаток для управління агропідприємством.

## Технології

- **React 18** + **TypeScript**
- **Vite** — сборщик
- **Ant Design 5** — UI компоненти (Modal, Form, Table, Select, DatePicker...)
- **React Router v6** — маршрутизація
- **Axios** — HTTP клієнт з JWT + X-Tenant-Id interceptors
- **Zustand** — управління станом (auth + i18n)
- **Recharts** — графіки та аналітика
- **React Leaflet** — карти полів (GeoJSON)

## Швидкий старт

```bash
cd frontend
npm install
npm run dev
```

Додаток запуститься на http://localhost:3000

## Конфігурація

Скопіюйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Встановіть змінну:
```
VITE_API_URL=http://localhost:5000
```

## Збирання для production

```bash
npm run build
```

## Структура

```
src/
├── api/          — Axios клієнт та API-модулі (з підтримкою пагінації та повним CRUD)
├── components/   — Перевикористовувані компоненти
├── i18n/         — Переклади (uk / en), хук useTranslation()
├── pages/        — Сторінки по модулях (з CRUD-модальнями)
├── stores/       — Zustand стан (authStore, langStore)
├── types/        — TypeScript типи (відповідають бекенд DTO + PaginatedResult)
└── App.tsx       — Маршрутизація
```

## Модулі

| Шлях | Опис | Функціональність |
|------|------|-----------------|
| `/` | Головна панель | Статистика, графіки (pie, bar, line) |
| `/fields` | Поля | Список (пагінація), створення, видалення |
| `/fields/:id` | Деталі поля | Призначення культури, плани сівозміни |
| `/warehouses` | Склади | Список (пагінація), створення |
| `/warehouses/items` | Залишки | Пагінація, прихід, витрата |
| `/operations` | Агрооперації | Список (пагінація), створення, фільтри |
| `/operations/:id` | Деталі операції | Ресурси, техніка, завершення |
| `/machinery` | Техніка | Список (пагінація), створення, пошук |
| `/machinery/:id` | Деталі техніки | Наробіток, заправки |
| `/economics` | Витрати | Список (пагінація), запис, видалення |

## Ключові можливості

- ✅ **Серверна пагінація** — всі списки використовують `PaginatedResult<T>` з бекенду
- ✅ **Повний CRUD** — створення через модальні вікна Ant Design на всіх сторінках
- ✅ **Двомовний інтерфейс** (uk/en) з Zustand-store та persistent storage
- ✅ **Ролева авторизація** (5 ролей) + JWT + X-Tenant-Id
- ✅ **Зелена тема** (#52c41a) + темний sidebar
- ✅ **TypeScript** — повна типізація DTO та API
