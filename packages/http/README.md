# 🌐 @notification-platform/http

Инфраструктурный слой для создания **HTTP-серверов** на базе `Express`. Пакет предоставляет типобезопасную фабрику для управления жизненным циклом сервера и набор готовых **middleware** для аутентификации, авторизации, телеметрии и обработки ошибок, реализуя принцип «конструктора» для сборки защищённых и наблюдаемых сервисов.

---

## 🚀 Основные возможности

- **Server Lifecycle**: Управление запуском и **graceful shutdown** с защитой от гонок состояний (`isStarting`, `isShuttingDown`).
- **Security**: Готовые middleware для JWT-аутентификации (через `express-oauth2-jwt-bearer`), ролевой авторизации и их mock-версии для тестирования/разработки.
- **Observability**: Встроенная поддержка распределённого трейсинга (OpenTelemetry), сбора метрик (latency, RPS) и структурированного логирования запросов.
- **Error Handling**: Стандартизированные обработчики для ошибок 404, 500, 504 и т.д..

---

## 🛠 Использование

### 1. Инициализация сервера

Фабричная функция `createServer` принимает зависимости (массивы pre/post handlers, роутер) и конфигурацию. Она возвращает объект с методами `start` и `shutdown`. Сервер автоматически регистрирует переданные обработчики в указанном порядке.

Для логирования событий запуска и остановки сервера рекомендуется использовать декоратор `withLoggingDecorator`.

```typescript
import {
  createServer,
  withLoggingDecorator,
} from "@notification-platform/http";
import { createLogger } from "@notification-platform/telemetry";
import express from "express";
import { router } from "./routes.js";
import { telemetryMiddleware } from "./middleware.js";

// Конфигурация сервера
const serverConfig = { port: 3000 };
const serverDependencies = {
  preHandlers: [telemetryMiddleware], // Middleware, выполняемые до роутера
  router, // Основной роутер приложения
  postHandlers: [notFoundMiddleware, internalErrorMiddleware], // Обработчики ошибок (обычно идут после роутера)
};

const rawServer = createServer(serverDependencies, serverConfig);
const logger = createLogger();

const server = withLoggingDecorator({ rawServer, logger }); // Добавляем логирование жизненного цикла

// Запуск
await server.start();

// Graceful shutdown
process.on("SIGTERM", () => server.shutdown());
process.on("SIGINT", () => server.shutdown());
```

### 2. Аутентификация и Авторизация

Пакет предоставляет фабрики для создания middleware безопасности. Аутентификация расширяет объект `Request` полем `user` (интерфейс `UserContext`), которое используется последующими middleware и контроллерами.

**Аутентификация (`createAuthenticationMiddleware`):**
Проверяет JWT токен against JWKS. При успехе инжектит данные пользователя. При ошибке возвращает `401 Unauthorized`.

**Авторизация (`createAuthorizationMiddleware`):**
Проверяет роли пользователя (`req.user.roles`) на соответствие требуемым (`requiredRoles`). Возвращает `403 Forbidden` при несоответствии.

> 💡 Для локальной разработки или тестов доступны mock-версии: `createMockAuthenticationMiddleware` и `createMockAuthorizationMiddleware`, которые подставляют фиктивного пользователя и пропускают проверку прав.

```typescript
import {
  createAuthenticationMiddleware,
  createAuthorizationMiddleware,
} from "@notification-platform/http";

// Настоящая аутентификация
const authMiddleware = createAuthenticationMiddleware({
  issuer: "https://auth.example.com",
  audience: "notification-api",
  jwksUri: "https://auth.example.com/.well-known/jwks.json",
  tokenSigningAlg: "RS256",
});

// Проверка ролей
const adminOnlyMiddleware = createAuthorizationMiddleware({
  requiredRoles: ["admin", "manager"],
});

// Использование в роутах
app.post(
  "/notifications/send",
  authMiddleware,
  adminOnlyMiddleware,
  sendNotificationController,
);
```

### 3. Телеметрия (Метрики, Логи, Трейсы)

Middleware для observability автоматически собирают данные о каждом входящем запросе. Они зависят от экземпляров `logger`, `meter` и `tracer`, созданных в пакете `@notification-platform/telemetry`.

- **Трейсинг (`createTracerMiddleware`)**: Восстанавливает контекст из заголовков (`traceparent`), создаёт спан типа `SERVER` с атрибутами HTTP (method, url, status) и оборачивает весь цикл обработки запроса.
- **Логирование (`createLoggerMiddleware`)**: Пишет логи завершения запроса с уровнем, зависящим от статуса (`debug` < 400, `warn` 4xx, `error` 5xx). Включает `durationMs`, IP, User-Agent. Обрабатывает прерванные соединения (client abort).
- **Метрики (`createMeterMiddleware`)**: Инкрементирует счетчик `http_requests_total` и записывает гистограмму `http_requests_duration_ms` с лейблами `statusCode`.

```typescript
import {
  createTracerMiddleware,
  createLoggerMiddleware,
  createMeterMiddleware,
} from "@notification-platform/http";
import { tracer, logger, meter } from "@notification-platform/telemetry";

// Порядок важен: Tracer -> Logger -> Meter -> Business Logic
app.use(
  createTracerMiddleware({ tracer }),
  createLoggerMiddleware({ logger }),
  createMeterMiddleware({ meter }),
);
```

### 4. Обработка ошибок и Rate Limiting

В конце цепочки middleware необходимо установить обработчики ошибок. Пакет предоставляет готовые решения для стандартных сценариев.

- `createNotFoundMiddleware()`: Возвращает `404` для неизвестных путей.
- `createTimeoutErrorMiddleware()`: Перехватывает ошибки `p-timeout.TimeoutError` и возвращает `504 Gateway Timeout`.
- `createInternalServerErrorMiddleware()`: Глобальный перехватчик необработанных исключений (`500`).
- `createRateLimiterMiddleware()`: Ограничение частоты запросов (окно времени + макс. запросов). _Рекомендуется использовать для бизнес-лимитов, технические лимиты лучше выносить на уровень Nginx._

```typescript
import {
  createNotFoundMiddleware,
  createTimeoutErrorMiddleware,
  createInternalServerErrorMiddleware,
  createRateLimiterMiddleware,
} from "@notification-platform/http";

// ... роуты ...

// Обработчики ошибок (строго в конце!)
app.use(
  createRateLimiterMiddleware({ windowMs: 60000, max: 100 }), // Опционально
  createNotFoundMiddleware(),
  createTimeoutErrorMiddleware(),
  createInternalServerErrorMiddleware(),
);
```

---

## ▶️ Основные команды

| Команда                 | Описание                                      |
| ----------------------- | --------------------------------------------- |
| `npm run build`         | Сборка TypeScript-кода в директорию `dist/`   |
| `npm run test`          | Запуск unit- и интеграционных тестов (Vitest) |
| `npm run test:coverage` | Запуск тестов с генерацией отчёта о покрытии  |
| `npm run lint`          | Проверка кода с помощью ESLint                |
| `npm run lint:fix`      | Автоисправление ошибок линтера                |
| `npm run lint:format`   | Форматирование кода с помощью Prettier        |
| `npm run typecheck`     | Проверка типов без генерации файлов           |
