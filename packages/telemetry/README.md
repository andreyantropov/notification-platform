# 📊 @notification-platform/telemetry

Инфраструктурный слой для реализации **Observability** в микросервисах платформы. Пакет предоставляет унифицированные обёртки над OpenTelemetry SDK, Winston и метриками, обеспечивая сквозную трассировку, структурированное логирование и сбор метрик с минимальными усилиями со стороны разработчика.

---

## 🚀 Основные возможности

- **Tracing**: Автоматическая трассировка HTTP/Express запросов и ручное управление спанами через совместимый с OpenTelemetry интерфейс.
- **Logging**: Структурированное логирование через Winston с автоматической привязкой `trace_id`, нормализацией ключей в `snake_case` и безопасной сериализацией ошибок.
- **Metrics**: Простой типобезопасный интерфейс для сбора кастомных метрик (Counters, Gauges, Histograms) с поддержкой лейблов.

---

## 🛠 Использование

### 1. Инициализация SDK

SDK должен быть запущен **до** загрузки любых других модулей приложения, чтобы гарантировать перехват всех входящих запросов и корректную работу контекста. Рекомендуется использовать точку входа `instrumentation.ts`, подключаемую через флаг `--import` (Node.js 18.19+) или предзагрузчик.

Конфигурация позволяет гибко управлять экспортерами трассировки и метрик, уровнем логирования и именем сервиса (используется в тегах `service.name`).

```typescript
import { createSDK } from "@notification-platform/telemetry";

const sdk = createSDK({
  name: "delivery-service",
  version: "1.0.0",
  environment: "production", // Влияет на тег deployment.environment
  port: 3000,
  exporters: {
    logsExporterUrl: "http://loki:4318/v1/logs",
    tracesExporterUrl: "http://jaeger:4318/v1/traces",
    metricsExporterUrl: "http://prometheus:9090/api/v1/write",
  },
});

// Инициализация должна завершиться до старта сервера
await sdk.start();
```

### 2. Логирование

Логгер (`createLogger`) автоматически извлекает активный контекст трассировки и добавляет `trace_id` и `span_id` в каждый лог. Это обеспечивает корреляцию логов с трейсами в системах визуализации (Grafana/Loki/Jaeger).

Ключи объекта лога автоматически приводятся к `snake_case` для единообразия, а объекты ошибок сериализуются с сохранением стека вызовов и дополнительных свойств.

**Структура лога:**

Интерфейс Log определяет обязательные и опциональные поля для стандартизации событий:

- `message`: Краткое, человеко-читаемое описание события (обязательное поле).
- `eventType`: Категория события (тип `EventType`, например, `lifecycle`). Используется для группировки и алертинга.
- `trigger`: Источник вызова логики (тип `TriggerType`, например, `cron`, `api`).
- `durationMs`: Длительность операции в миллисекундах (опционально).
- `details`: Объект с произвольными бизнес-данными. Все ключи внутри будут приведены к `snake_case`.
- `error`: Экземпляр ошибки. Будет автоматически сериализовано.

```typescript
import { createLogger } from "@notification-platform/telemetry";
const logger = createLogger();

// Пример успешного события
logger.info({
  message: "Notification sent successfully",
  eventType: EVENT_TYPE.MESSAGING,
  trigger: TRIGGER_TYPE.API,
  durationMs: 150,
  details: {
    channelId: "email-primary",
    recipientAddress: "user@example.com",
    retryCount: 0,
  },
});

// Пример обработки ошибки
try {
  // ...логика
} catch (err) {
  logger.error({
    message: "Failed to deliver notification",
    eventType: EVENT_TYPE.MESSAGING,
    trigger: TRIGGER_TYPE.API,
    error: err, // Автоматическая сериализация
    details: { notificationId: "uuid-123" },
  });
}
```

### 3. Метрики

Интерфейс `createMeter` предоставляет типобезопасные методы для работы с метриками. Поддерживаются стандартные типы: `Counter`, `Gauge` и `Histogram`.

Все метрики автоматически обогащаются атрибутами ресурса (имя сервиса, версия, окружение).

```typescript
import { createMeter } from "@notification-platform/telemetry";

const meter = createMeter();

// Увеличение счетчика (на единицу) с лейблами
meter.increment("notifications_total", {
  channel: "email",
  status: "success",
});

// Увеличение счетчика на опциональное значение с лейблами
meter.add("notifications_total", 4, {
  channel: "email",
  status: "success",
});

// Запись значения в Gauge (например, изменение размера)
meter.gauge("queue_size", -2, { queue_name: "high_priority" });

// Наблюдение за длительностью операции (Histogram)
meter.histogram("processing_duration_seconds", 300, {
  operation: "template_render",
});
```

### 4. Трейсинг

Интерфейс `createTracer` предоставляет инструменты для ручного управления спанами и поддержки распределённого трейсинга. Он позволяет оборачивать асинхронные операции в спаны, продолжать трассировку из входящих заголовков и извлекать заголовки для исходящих запросов.

**Основные методы:**

- `startActiveSpan(name, fn, options?)`: Выполняет функцию `fn` в контексте нового активного спана. Возвращает результат функции. Опционально можно указать `kind` (тип спана) и `attributes`.
- `continueTrace(headers, fn)`: Восстанавливает контекст трассировки из входящих HTTP-заголовков перед выполнением функции `fn`. Критично для микросервисов, принимающих запросы от других сервисов.
- `getTraceHeaders()`: Возвращает текущие заголовки трассировки (например, `traceparent`) для инъекции в исходящие запросы.

```typescript
import { createTracer } from "@notification-platform/telemetry";
import { SpanKind } from "./types";

const tracer = createTracer();

// 1. Ручное создание спана для сложной операции
const result = await tracer.startActiveSpan(
  "process-delivery-batch",
  async () => {
    // Логика обработки...
    // Спан автоматически становится активным контекстом для вложенных операций
    return await processItems(items);
  },
  {
    kind: SpanKind.Consumer, // Указываем тип операции
    attributes: { "batch.size": "10", "queue.name": "notifications" },
  },
);

// 2. Продолжение трассировки из входящего запроса (например, в Middleware)
async function handleIncomingRequest(req: Request, res: Response) {
  return tracer.continueTrace(req.headers, async () => {
    // Весь код внутри будет связан с trace_id из заголовков
    return await businessLogic(req.body);
  });
}

// 3. Извлечение заголовков для исходящего запроса
const traceHeaders = tracer.getTraceHeaders();
await fetch("http://next-service/api", {
  headers: traceHeaders, // Передаем контекст дальше
});
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
