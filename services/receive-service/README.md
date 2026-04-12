# 📥 Receive Service

**API-шлюз платформы уведомлений**. Отвечает за приём входящих запросов, аутентификацию, валидацию payload, обогащение данных и постановку уведомлений в очередь сообщений для последующей обработки сервисом доставки (`delivery-service`).

> ⚡ **Архитектурная роль**: Сервис является «фасадом» системы. Он не отправляет уведомления напрямую, а гарантирует, что в очередь попадут только корректные, авторизованные и нормализованные события.

---

## 🚀 Основные возможности

- **Unified Ingestion API**: Единый интерфейс для приёма одиночных и пакетных (batch) уведомлений от внутренних сервисов.
- **Security & Validation**: Строгая валидация входящих данных, JWT-аутентификация и проверка прав доступа перед постановкой в очередь.
- **Data Enrichment**: Автоматическое обогащение метаданными (инициатор, таймстампы и т.д.).
- **Async Processing**: Мгновенный ответ клиенту после успешной публикации сообщения в брокер (AMQP), без блокировки на время реальной доставки.

---

## 📄 Конфигурация

Все параметры задаются через переменные окружения.  
Полный список с описанием, обязательностью и значениями по умолчанию — в файле:  
👉 [.env.example](./.env.example)

```bash
cp .env.example .env
# Отредактируйте .env под ваше окружение
```

---

## 🚀 Быстрый старт

```bash
npm install
npm run build
npm run start
```

---

## ▶️ Основные команды

| Команда                 | Описание                                      |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Запуск в режиме разработки (.env.dev)         |
| `npm run build`         | Сборка TypeScript-кода в директорию `dist/`   |
| `npm run start`         | Запуск production-версии из `dist/index.js`   |
| `npm run test`          | Запуск unit- и интеграционных тестов (Vitest) |
| `npm run test:coverage` | Запуск тестов с генерацией отчёта о покрытии  |
| `npm run lint`          | Проверка кода с помощью ESLint                |
| `npm run lint:fix`      | Автоисправление ошибок линтера                |
| `npm run lint:format`   | Форматирование кода с помощью Prettier        |

---

## 📡 API

Все запросы (кроме healthchecks) требуют заголовок аутентификации:  
`Authorization: Bearer <JWT_TOKEN>`

### Одиночное уведомление

```http
POST /api/v1/notifications
Content-Type: application/json

{
  "contacts": [
    { "type": "bitrix", "value": 4582 },
    { "type": "email", "value": "user@company.com" }
  ],
  "message": "Заказ #123 готов"
}
```

### Пакетная отправка (до 50 шт.)

```http
POST /api/v1/notifications/batch
Content-Type: application/json

[
  {
    "contacts": [{ "type": "email", "value": "admin@company.com" }],
    "message": "Отчет сформирован"
  },
  {
    "contacts": [{ "type": "bitrix", "value": 101 }],
    "message": "Требуется согласование",
    "strategy": "send_to_all_available"
  }
]
```

> Подробное описание API - в документе [api.md](../../docs/architecture/api.md).

---

## 🩺 Healthcheck

Сервис предоставляет стандартные эндпоинты для оркестраторов:

- **Liveness**: `GET /health/live` — процесс жив.
- **Readiness**: `GET /health/ready` — все зависимости доступны.

Используйте в `livenessProbe` / `readinessProbe` Kubernetes.

---

## 🐳 Docker

Сервис можно запустить в Docker-контейнере.  
Подробная инструкция по сборке, запуску и управлению — в документе [docker.md](./docs/docker.md).

---

## 📚 Документация

- [ADR (Architectural Decision Records)](../../docs/adr/)
- [Архитектура](../../docs/architecture/architecture.md)
- [Соглашения по коду](../../docs/guideline.md)
