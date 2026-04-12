import { type Notification } from "@notification-platform/core";

import { type DispatchService } from "../../../../application/services/index.js";

import { type MetricsDecoratorDependencies } from "./interfaces/index.js";

export const withMetricsDecorator = (
  dependencies: MetricsDecoratorDependencies,
): DispatchService => {
  const { dispatchService, meter } = dependencies;

  const dispatch = async (notification: Notification): Promise<void> => {
    const start = Date.now();
    let status = "success";

    try {
      await dispatchService.dispatch(notification);
    } catch (error) {
      status = "error";
      throw error;
    } finally {
      const durationMs = Date.now() - start;
      const labels = {
        status,
      };

      meter.increment("notifications_dispatched_total", labels);
      meter.record("notifications_dispatched_duration_ms", durationMs, labels);
    }
  };

  return { ...dispatchService, dispatch };
};
