import { type AMQPChannel } from "@cloudamqp/amqp-client";
import { EVENT_TYPE, TRIGGER_TYPE } from "@notification-platform/telemetry";

import { type Broker } from "../../../createBroker/index.js";

import { type LoggingDecoratorDependencies } from "./interfaces/index.js";

export const withLoggingDecorator = (
  dependencies: LoggingDecoratorDependencies,
): Broker => {
  const { broker, logger } = dependencies;

  const start = async (): Promise<void> => {
    const start = Date.now();
    let error: unknown;

    try {
      await broker.start();
    } catch (err) {
      error = err;

      throw err;
    } finally {
      const durationMs = Date.now() - start;
      const isSuccess = !error;

      const log = {
        message: isSuccess
          ? "Брокер успешно запущен"
          : "Не удалось запустить брокер",
        eventName: "broker.start",
        eventType: EVENT_TYPE.LIFECYCLE,
        trigger: TRIGGER_TYPE.MANUAL,
        durationMs,
        ...(error ? { error } : {}),
      };

      if (isSuccess) {
        logger.debug(log);
      } else {
        logger.fatal(log);
      }
    }
  };

  const createChannel = async (): Promise<AMQPChannel> => {
    const start = Date.now();
    let result: AMQPChannel | undefined;
    let error: unknown;

    try {
      result = await broker.createChannel();

      return result;
    } catch (err) {
      error = err;

      throw err;
    } finally {
      const durationMs = Date.now() - start;
      const isSuccess = !error;

      const log = {
        message: isSuccess
          ? "Канал успешно создан"
          : "Не удалось создать канал",
        eventName: "broker.create_channel",
        eventType: EVENT_TYPE.LIFECYCLE,
        trigger: TRIGGER_TYPE.MANUAL,
        durationMs,
        details: {
          ...(result ? { id: result.id } : {}),
        },
        ...(error ? { error } : {}),
      };

      if (isSuccess) {
        logger.debug(log);
      } else {
        logger.error(log);
      }
    }
  };

  const closeChannel = async (channel: AMQPChannel): Promise<void> => {
    const start = Date.now();
    let error: unknown;

    try {
      await broker.closeChannel(channel);
    } catch (err) {
      error = err;

      throw err;
    } finally {
      const durationMs = Date.now() - start;
      const isSuccess = !error;

      const log = {
        message: isSuccess
          ? "Канал успешно закрыт"
          : "Не удалось закрыть канал",
        eventName: "broker.close_channel",
        eventType: EVENT_TYPE.LIFECYCLE,
        trigger: TRIGGER_TYPE.MANUAL,
        durationMs,
        ...(error ? { error } : {}),
      };

      if (isSuccess) {
        logger.debug(log);
      } else {
        logger.error(log);
      }
    }
  };

  const shutdown = async (): Promise<void> => {
    const start = Date.now();
    let error: unknown;

    try {
      await broker.shutdown();
    } catch (err) {
      error = err;

      throw err;
    } finally {
      const durationMs = Date.now() - start;
      const isSuccess = !error;

      const log = {
        message: isSuccess
          ? "Брокер успешно остановлен"
          : "Не удалось остановить брокер",
        eventName: "broker.shutdown",
        eventType: EVENT_TYPE.LIFECYCLE,
        trigger: TRIGGER_TYPE.MANUAL,
        durationMs,
        ...(error ? { error } : {}),
      };

      if (isSuccess) {
        logger.debug(log);
      } else {
        logger.fatal(log);
      }
    }
  };

  return { start, createChannel, closeChannel, shutdown };
};
