import {
  createBroker,
  withLoggingDecorator as withBrokerLoggingDecorator,
} from "@notification-platform/amqp";
import {
  createServer,
  withLoggingDecorator as withServerLoggingDecorator,
} from "@notification-platform/http";
import {
  createLogger,
  createMeter,
  createTracer,
} from "@notification-platform/telemetry";
import { asFunction, type AwilixContainer } from "awilix";

import { createPublisher } from "../../../infrastructure/amqp/index.js";
import { createIdGenerator } from "../../../infrastructure/crypto/index.js";
import {
  withLoggingDecorator as withPublisherLoggingDecorator,
  withMetricsDecorator as withPublisherMetricsDecorator,
  withTracingDecorator as withPublisherTracingDecorator,
} from "../../../infrastructure/decorators/Publisher/index.js";
import { createHealthReporter } from "../../../infrastructure/health/index.js";
import { type Container } from "../interfaces/index.js";

export const registerInfrastracture = (
  container: AwilixContainer<Container>,
) => {
  container.register({
    publisher: asFunction(({ broker, env, tracer, logger, meter }) => {
      const channelPromise = broker.createChannel();
      const publisher = createPublisher(
        { channelPromise },
        {
          exchange: env.PUBLISHER_EXCHANGE,
          routingKey: env.PUBLISHER_ROUTING_KEY,
          timeoutMs: env.PUBLISHER_TIMEOUT_MS,
        },
      );
      const publisherWithTracing = withPublisherTracingDecorator({
        publisher: publisher,
        tracer,
      });
      const publisherWithLogging = withPublisherLoggingDecorator({
        publisher: publisherWithTracing,
        logger,
      });
      const publisherWithMetrics = withPublisherMetricsDecorator({
        publisher: publisherWithLogging,
        meter,
      });

      return publisherWithMetrics;
    }).singleton(),

    idGenerator: asFunction(() => {
      return createIdGenerator();
    }).singleton(),

    healthReporter: asFunction(({ publisher }) => {
      return createHealthReporter({ objects: [publisher] });
    }).singleton(),

    logger: asFunction(({ env }) => {
      return createLogger({ level: env.LOG_LEVEL });
    }).singleton(),

    meter: asFunction(({ env }) => {
      return createMeter({ serviceName: env.SERVICE_NAME });
    }).singleton(),

    tracer: asFunction(({ env }) => {
      return createTracer({ serviceName: env.SERVICE_NAME });
    }).singleton(),

    broker: asFunction(({ env, logger }) => {
      const broker = createBroker({ url: env.BROKER_URL });
      const brokerWithLogging = withBrokerLoggingDecorator({ broker, logger });

      return brokerWithLogging;
    }).singleton(),

    server: asFunction(({ env, logger, preHandlers, router, postHandlers }) => {
      const server = createServer(
        { preHandlers, router, postHandlers },
        { port: env.SERVICE_PORT },
      );
      const serverWithLogging = withServerLoggingDecorator({ server, logger });

      return serverWithLogging;
    }).singleton(),
  });
};
