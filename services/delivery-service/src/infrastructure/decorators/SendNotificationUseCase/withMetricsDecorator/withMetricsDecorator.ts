import { type Notification } from "@notification-platform/core";

import { type MetaData } from "../../../../application/types/index.js";
import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

import { type MetricsDecoratorDependencies } from "./interfaces/index.js";

export const withMetricsDecorator = (
  dependencies: MetricsDecoratorDependencies,
): SendNotificationUseCase => {
  const { sendNotificationUseCase, meter } = dependencies;

  const execute = async (
    notification: Notification,
    metadata?: MetaData,
  ): Promise<void> => {
    const start = Date.now();
    let status = "success";

    try {
      await sendNotificationUseCase.execute(notification, metadata);
    } catch (error) {
      status = "error";

      throw error;
    } finally {
      const durationMs = Date.now() - start;
      const labels = {
        status,
      };

      meter.increment("notifications_consumed_total", labels);
      meter.record("notifications_consumed_duration_ms", durationMs, labels);
    }
  };

  return { ...sendNotificationUseCase, execute };
};
