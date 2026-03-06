# 🌾 АгроПлатформа — Фронтенд

React 18 + TypeScript + Vite приложение для управления агропредприятием.

## Технологии

- **React 18** + **TypeScript**
- **Vite** — сборщик
- **Ant Design 5** — UI компоненты
- **React Router v6** — маршрутизация
- **Axios** — HTTP клиент
- **Zustand** — управление состоянием
- **Recharts** — графики и аналитика
- **React Leaflet** — карты полей (GeoJSON)

## Быстрый старт

```bash
cd frontend
npm install
npm run dev
```

Приложение запустится на http://localhost:3000

## Конфигурация

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Установите переменную:
```
VITE_API_URL=http://localhost:5000
```

## Сборка для production

```bash
npm run build
```

## Структура

```
src/
├── api/          — Axios клиент и API-модули
├── components/   — Переиспользуемые компоненты
├── pages/        — Страницы по модулям
├── stores/       — Zustand состояние
├── types/        — TypeScript типы (соответствуют бэкенд DTO)
└── App.tsx       — Маршрутизация
```

## Модули

| Путь | Описание |
|------|----------|
| `/` | Главная панель с графиками |
| `/fields` | Поля |
| `/warehouses` | Склады и остатки |
| `/operations` | Агрооперации |
| `/machinery` | Техника |
| `/economics` | Затраты |
