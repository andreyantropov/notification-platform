import { type Notification } from "@notification-platform/core";

import { type MetaData } from "../../../../application/types/index.js";
import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

import { TRACE_KEYS } from "./constants/index.js";
import { type TracingDependencies } from "./interfaces/index.js";

export const withTracing = (
  dependencies: TracingDependencies,
): SendNotificationUseCase => {
  const { sendNotificationUseCase, tracer } = dependencies;

  const execute = async (
    notification: Notification,
    metadata?: MetaData,
  ): Promise<void> => {
    const traceHeaders: Record<string, string> = {};

    if (metadata) {
      for (const key of TRACE_KEYS) {
        const value = metadata[key];
        if (typeof value === "string") {
          traceHeaders[key] = value;
        }
      }
    }

    return tracer.continueTrace(traceHeaders, async () => {
      await sendNotificationUseCase.execute(notification, metadata);
    });
  };

  return {
    ...sendNotificationUseCase,
    execute,
  };
};
