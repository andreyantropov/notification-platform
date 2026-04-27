import { type Notification } from "@notification-platform/core";

import { type Publisher } from "../../../../application/ports/index.js";

import { type MetricsDependencies } from "./interfaces/index.js";

export const withMetrics = (dependencies: MetricsDependencies): Publisher => {
  const { publisher, meter } = dependencies;

  const publish = async (
    notification: Notification,
    metadata?: Record<string, string>,
  ): Promise<void> => {
    const start = Date.now();
    let status = "success";

    try {
      await publisher.publish(notification, metadata);
    } catch (error) {
      status = "error";

      throw error;
    } finally {
      const durationMs = Date.now() - start;
      const labels = { status };

      meter.increment("notifications_published_total", labels);
      meter.record("notifications_published_duration_ms", durationMs, labels);
    }
  };

  return { ...publisher, publish };
};
