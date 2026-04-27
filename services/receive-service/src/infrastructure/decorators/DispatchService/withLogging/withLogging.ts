import { type Notification } from "@notification-platform/core";
import { EVENT_TYPE, TRIGGER_TYPE } from "@notification-platform/telemetry";

import { type DispatchService } from "../../../../application/services/index.js";

import { type LoggingDependencies } from "./interfaces/index.js";

export const withLogging = (
  dependencies: LoggingDependencies,
): DispatchService => {
  const { dispatchService, logger } = dependencies;

  const dispatch = async (notification: Notification): Promise<void> => {
    const start = Date.now();
    let error: unknown;

    try {
      await dispatchService.dispatch(notification);
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
        eventName: "notification.dispatch",
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

  return { ...dispatchService, dispatch };
};
