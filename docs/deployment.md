---
layout: default
title: Деплой
---

# 🚀 Руководство по развёртыванию

[← Назад на главную](.)

---

## Docker Compose (рекомендуется)

### Требования

- Docker Engine ≥ 24
- Docker Compose ≥ 2.x

### Быстрый запуск

```bash
git clone https://github.com/barach6662001-bit/AgroPlatform.git
cd AgroPlatform
docker-compose up --build -d
```

После запуска:
- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8080](http://localhost:8080)
- Swagger: [http://localhost:8080/swagger](http://localhost:8080/swagger)

### Остановка

```bash
docker-compose down          # остановить контейнеры
docker-compose down -v       # остановить и удалить volumes (данные БД)
```

---

## Production-деплой

### Конфигурация через переменные окружения

Скопируйте `.env.example` в `.env` и задайте значения:

```bash
cp .env.example .env
```

| Переменная | Описание | Обязательно |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | ✅ |
| `JwtSettings__Key` | HMAC ключ JWT (≥ 32 символа) | ✅ |
| `JwtSettings__Issuer` | Издатель JWT | ✅ |
| `JwtSettings__Audience` | Аудитория JWT | ✅ |
| `Cors__AllowedOrigins__0` | Разрешённый CORS origin (URL фронтенда) | ✅ |
| `Swagger__Enabled` | Включить Swagger в prod | ❌ (по умолчанию `false`) |
| `RateLimiting__ReadPermitLimit` | Лимит GET запросов / окно | ❌ (по умолчанию `100`) |
| `RateLimiting__WritePermitLimit` | Лимит POST/PUT/DELETE / окно | ❌ (по умолчанию `30`) |

> **Безопасность:** Используйте надёжный секрет для `JwtSettings__Key` (≥ 32 случайных символа). Никогда не коммитьте реальные секреты в репозиторий.

### Production Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## TLS / HTTPS

### Через Nginx (рекомендуется для продакшена)

Пример конфигурации Nginx с Let's Encrypt:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /api/ {
        proxy_pass http://api:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend:3000/;
        proxy_set_header Host $host;
    }
}
```

### Получение сертификата Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## CI/CD (GitHub Actions)

Проект включает готовые workflows:

### `ci.yml` — Continuous Integration
Запускается на каждый push в `main` и на каждый Pull Request:
- Lint и TypeScript-проверка фронтенда
- Сборка и юнит-тесты бэкенда
- Интеграционные тесты (Testcontainers)
- Сканирование уязвимостей (`dotnet list package --vulnerable`)

### `cd.yml` — Continuous Deployment
Запускается на push в `main` и на теги:
- Сборка и публикация Docker-образов в GitHub Container Registry (ghcr.io)
- Образы тегируются: имя ветки, SHA коммита, `latest` для main

### `release.yml` — Release Management
Запускается на теги `v*`:
- Публикация API и фронтенда как ZIP-артефактов
- Создание GitHub Release с автоматическими release notes

---

## Мониторинг

### Health Checks

| Endpoint | Описание |
|----------|----------|
| `GET /health/live` | Liveness probe — приложение запущено |
| `GET /health/ready` | Readiness probe — база данных доступна |

Эти эндпоинты можно использовать в Kubernetes или Docker Compose healthcheck:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health/ready"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

[← Назад на главную](.)
