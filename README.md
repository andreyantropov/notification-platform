# 📣 Notification Platform

**Монорепозиторий** микросервисной платформы уведомлений. Объединяет сервисы приёма, доставки, а также набор переиспользуемых инфраструктурных пакетов для отправки транзакционных сообщений через каналы **Bitrix24**, **Email** и другие.

> 🧩 **Архитектура**: Построена на принципах DDD (Shared Kernel) и Clean Architecture. Использует **pnpm workspaces** для управления зависимостями и **Turborepo** для оркестрации задач сборки и тестирования.

---

## 🏗️ Структура проекта

Репозиторий организован по принципу модульности, разделяя доменное ядро, инфраструктурные библиотеки и бизнес-сервисы.

```text
notification-platform/
├── core/                   # Shared Kernel: доменные типы и интерфейсы
├── packages/               # Инфраструктурные пакеты (библиотеки)
│   ├── http                # Обёртка над Express, middleware безопасности и телеметрии
│   ├── amqp                # Управление соединениями и каналами RabbitMQ
│   └── telemetry           # OpenTelemetry, Winston, метрики и трейсинг
├── services/               # Микросервисы (приложения)
│   ├── receive-service     # API Gateway: приём, валидация, публикация в очередь
│   └── delivery-service    # Worker: потребление очереди, стратегии, отправка
├── infra/                  # Инфраструктура
└── docs/                   # Документация
```

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

Инициализация всех workspace'ов и установка общих зависимостей:

```bash
pnpm install
```

### 2. Настройка окружения

Скопируйте примеры файлов окружения для сервисов и заполните их актуальными данными (URL брокера, секреты API и т.д.):

```bash
cp services/receive-service/.env.example services/receive-service/.env
cp services/delivery-service/.env.example services/delivery-service/.env
```

### 3. Запуск инфраструктуры и сервисов

Для полного разворачивания платформы локально используйте Docker Compose:

```bash
docker-compose up --build
```

После запуска сервисы будут доступны по следующим адресам:

- **Receive Service**: `http://localhost:3001`
- **Delivery Service**: `http://localhost:3002`

> 🩺 **Проверка статуса**: Все сервисы предоставляют эндпоинты здоровья.
>
> - Liveness: `GET /health/live`
> - Readiness: `GET /health/ready`

### 4. Запуск контейнеров через Docker Compose

#### Подготовка окружения

Скопируйте файл с переменными окружения для разработки:

```bash
cp services/*-service/.env.example services/*-service/.env.dev
```

Отредактируйте `.env.dev` при необходимости (по умолчанию настройки уже предустановлены для локальной разработки).

#### Запуск всех сервисов

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

После запуска сервисы будут доступны:

- **Receive Service**: `http://localhost:3001`
- **Delivery Service**: `http://localhost:3002`
- **RabbitMQ UI**: `http://localhost:15672` (логин: `dev_user` / `dev_password`)

#### Полезные команды

```bash
# Просмотр логов
docker compose -f docker-compose.dev.yml logs -f

# Остановка сервисов
docker compose -f docker-compose.dev.yml down

# Полная очистка (с удалением томов)
docker compose -f docker-compose.dev.yml down -v
```

---

## 🛠️ Основные команды

Управление задачами осуществляется через **Turborepo** (`turbo`), что обеспечивает кэширование результатов и параллельное выполнение задач с учётом зависимостей между пакетами.

| Команда                  | Описание                                                       |
| ------------------------ | -------------------------------------------------------------- |
| `pnpm run build`         | Сборка TypeScript-кода во всех workspace'ах                    |
| `pnpm run dev`           | Запуск сервисов в режиме разработки с hot-reload               |
| `pnpm run test`          | Запуск unit- и интеграционных тестов (Vitest) во всех проектах |
| `pnpm run test:coverage` | Запуск тестов с генерацией отчёта о покрытии                   |
| `pnpm run lint`          | Проверка кода с помощью ESLint во всех проектах                |
| `pnpm run lint:fix`      | Автоматическое исправление ошибок линтера                      |
| `pnpm run lint:format`   | Форматирование кода с помощью Prettier                         |
| `pnpm run typecheck`     | Глобальная проверка типов TypeScript без генерации файлов      |

**Пример запуска команды для конкретного сервиса:**

```bash
pnpm --filter receive-service run dev
```

---

## 🐳 Docker

Сервис можно запустить в Docker-контейнере.  
Подробная инструкция по сборке, запуску и управлению — в документе [docker.md](./docs/docker.md).

---

## 📚 Документация

Подробное описание архитектурных решений, протоколов и стандартов разработки:

- [ADR (Architectural Decision Records)](./docs/adr/)
- [Архитектура платформы](./docs/architecture/architecture.md)
- [Соглашения по коду](./docs/guideline.md)
