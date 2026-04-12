import { type Notification } from "@notification-platform/core";
import { EVENT_TYPE, TRIGGER_TYPE } from "@notification-platform/telemetry";

import { type MetaData } from "../../../../application/types/index.js";
import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

import { type LoggingDecoratorDependencies } from "./interfaces/index.js";

export const withLoggingDecorator = (
  dependencies: LoggingDecoratorDependencies,
): SendNotificationUseCase => {
  const { sendNotificationUseCase, logger } = dependencies;

  const execute = async (
    notification: Notification,
    metadata?: MetaData,
  ): Promise<void> => {
    const start = Date.now();
    let error: unknown;

    try {
      await sendNotificationUseCase.execute(notification, metadata);
    } catch (err) {
      error = err;

      throw err;
    } finally {
      const durationMs = Date.now() - start;
      const isSuccess = !error;

      const log = {
        message: isSuccess
          ? "Уведомление успешно отправлено"
          : "Не удалось отправить уведомление",
        eventName: "notification.send",
        eventType: EVENT_TYPE.MESSAGING,
        trigger: TRIGGER_TYPE.QUEUE,
        durationMs,
        details: {
          id: notification.id,
        },
        ...(error ? { error } : {}),
      };

      if (isSuccess) {
        logger.info(log);
      } else {
        logger.error(log);
      }
    }
  };

  return { ...sendNotificationUseCase, execute };
};
