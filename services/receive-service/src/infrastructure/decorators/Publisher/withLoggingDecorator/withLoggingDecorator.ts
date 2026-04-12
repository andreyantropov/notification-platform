import { type Notification } from "@notification-platform/core";
import { EVENT_TYPE, TRIGGER_TYPE } from "@notification-platform/telemetry";

import { type Publisher } from "../../../../application/ports/index.js";

import { type LoggingDecoratorDependencies } from "./interfaces/index.js";

export const withLoggingDecorator = (
  dependencies: LoggingDecoratorDependencies,
): Publisher => {
  const { publisher, logger } = dependencies;

  const publish = async (
    notification: Notification,
    metadata?: Record<string, string>,
  ): Promise<void> => {
    const start = Date.now();
    let error: unknown;

    try {
      await publisher.publish(notification, metadata);
    } catch (err) {
      error = err;

      throw err;
    } finally {
      const durationMs = Date.now() - start;
      const isSuccess = !error;

      const log = {
        message: isSuccess
          ? `Уведомление успешно опубликовано`
          : `Не удалось опубликовать уведомление`,
        eventName: "notification.publish",
        eventType: EVENT_TYPE.MESSAGING,
        trigger: TRIGGER_TYPE.API,
        durationMs,
        details: { id: notification.id },
        ...(error ? { error } : {}),
      };

      if (isSuccess) {
        logger.info(log);
      } else {
        logger.error(log);
      }
    }
  };

  return { ...publisher, publish };
};
