# link-shortener

MVP сервиса сокращения ссылок с базовой аналитикой.

## Технологии

- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Cache: Redis
- Frontend: React, TypeScript, Vite
- Infrastructure: Docker Compose, Nginx (раздача собранного фронтенда)

## Переменные окружения

Скопируйте `.env.example` в `.env` в корне репозитория (нужно для локального запуска backend).

| Переменная | Описание | Пример |
| --- | --- | --- |
| `PORT` | Порт backend | `3000` |
| `DATABASE_URL` | Строка подключения PostgreSQL | `postgresql://postgres:postgres@localhost:5432/link_shortener` |
| `REDIS_URL` | Строка подключения Redis | `redis://localhost:6379` |
| `BASE_URL` | Публичный адрес API, из него собирается `shortUrl` | `http://localhost:3000` |
| `REDIS_TTL_SECONDS` | TTL кеша оригинального URL (1 час) | `3600` |
| `VITE_API_URL` | Базовый URL API для фронтенда | `http://localhost:3000` |

Для фронтенда локально скопируйте `frontend/.env.example` в `frontend/.env`.

При `docker compose up` переменные backend задаются в `docker-compose.yml` (хосты `postgres` и `redis`). Отдельный `.env` для полного Docker-запуска не обязателен.

## Локальный запуск

Нужны Node.js 22+ и Docker (для PostgreSQL и Redis).

1. Создайте `.env` из `.env.example`.
2. Поднимите инфраструктуру:

```bash
docker compose up -d postgres redis
```

3. Backend:

```bash
cd backend
npm install
npm run dev
```

API: `http://localhost:3000`.

4. Frontend:

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`.

## Запуск через Docker

Поднимает PostgreSQL, Redis, backend и frontend:

```bash
docker compose up --build
```

- UI: `http://localhost:8080`
- API: `http://localhost:3000`

В логах backend при редиректе видно работу кеша: `[cache] MISS` на первый запрос короткого кода и `[cache] HIT` на повторный (в пределах TTL 1 час).

Остановка:

```bash
docker compose down
```

## Примеры запросов к API

Создать короткую ссылку:

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d "{\"originalUrl\":\"https://example.com/some/long/path\"}"
```

Ответ:

```json
{
  "shortCode": "aB3dE9",
  "shortUrl": "http://localhost:3000/aB3dE9"
}
```

Перейти по короткой ссылке (увеличивает `clicks` на 1):

```bash
curl -i http://localhost:3000/aB3dE9
```

Получить статистику:

```bash
curl http://localhost:3000/api/stats/aB3dE9
```

Ответ:

```json
{
  "originalUrl": "https://example.com/some/long/path",
  "shortCode": "aB3dE9",
  "clicks": 1,
  "createdAt": "2026-09-07T17:00:00.000Z"
}
```

Проверка здоровья:

```bash
curl http://localhost:3000/health
```

## Ошибки API

- невалидный URL → `400`
- короткий код не найден → `404`
- не удалось сгенерировать уникальный код → `500`

## Структура проекта

```
backend/     REST API (контроллеры, сервисы, репозитории)
frontend/    React SPA
docker-compose.yml
.env.example
```
