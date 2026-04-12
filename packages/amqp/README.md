# 📦 @notification-platform/amqp

Инфраструктурный слой для работы с **AMQP** в микросервисах платформы. Пакет предоставляет типобезопасную обёртку над клиентом брокера сообщений, обеспечивая отказоустойчивое управление соединениями, каналами и интеграцию с системой телеметрии.

---

## 🚀 Основные возможности

- **Connection Management**: Автоматическое управление жизненным циклом соединения с защитой от гонок состояний (`isStarting`, `isShuttingDown`).
- **Channel Lifecycle**: Безопасное создание и закрытие каналов с валидацией принадлежности к активному соединению.
- **Observability**: Встроенная поддержка логирования событий брокера через декораторы, интегрированные с `@notification-platform/telemetry`.

---

## 🛠 Использование

### 1. Инициализация брокера

Фабричная функция `createBroker` создаёт экземпляр менеджера соединений. Конфигурация требует указания URL брокера (включая учётные данные). Соединение не устанавливается автоматически при создании — необходимо явно вызвать метод `start()`.

```typescript
import { createBroker } from "@notification-platform/amqp";

const broker = createBroker({
  url: "amqp://guest:guest@localhost:5672",
  // Дополнительные параметры подключения (если предусмотрены клиентом)
  connectionName: "delivery-service-connection",
});

// Установка соединения перед началом работы
await broker.start();
```

### 2. Управление каналами

Пакет предоставляет методы для создания и корректного закрытия каналов. Все операции проверяют текущее состояние соединения, предотвращая работу с закрытыми или закрывающимися коннектами.

> ⚠️ **Важно**: Объявление очередей, exchange и привязок (topology) остаётся ответственностью потребителя этого пакета. Данный слой отвечает только за транспорт.

```typescript
import { createBroker } from "@notification-platform/amqp";

const broker = createBroker({ url: "amqp://guest:guest@localhost:5672" });
await broker.start();

// Создание нового канала
const channel = await broker.createChannel();

// Использование канала для бизнес-логики (объявление, публикация, потребление)
await channel.queueDeclare("notifications_queue", { durable: true });
await channel.basicPublish("exchange", "routing.key", Buffer.from("message"));

// Корректное закрытие конкретного канала
await broker.closeChannel(channel);

// Полное завершение работы (graceful shutdown)
await broker.shutdown();
```

### 3. Логирование событий

Для интеграции с системой мониторинга доступен декоратор `withLoggingDecorator`. Он оборачивает экземпляр брокера, автоматически логируя ключевые события жизненного цикла (подключение, ошибки, создание каналов) через стандартный интерфейс логгера платформы.

```typescript
import {
  createBroker,
  withLoggingDecorator,
} from "@notification-platform/amqp";
import { createLogger } from "@notification-platform/telemetry";

const rawBroker = createBroker({ url: "amqp://guest:guest@localhost:5672" });
const logger = createLogger();

// Оборачиваем брокера для добавления логирования
const broker = withLoggingDecorator({ rawBroker, logger });

await broker.start();
// В логах появится запись о successful connection с trace_id (если контекст активен)
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
