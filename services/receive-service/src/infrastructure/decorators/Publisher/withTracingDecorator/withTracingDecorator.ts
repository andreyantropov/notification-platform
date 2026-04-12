import { type Notification } from "@notification-platform/core";

import { type Publisher } from "../../../../application/ports/index.js";

import { type TracingDecoratorDependencies } from "./interfaces/index.js";

export const withTracingDecorator = (
  dependencies: TracingDecoratorDependencies,
): Publisher => {
  const { publisher, tracer } = dependencies;

  const publish = async (
    notification: Notification,
    metadata?: Record<string, string>,
  ): Promise<void> => {
    const traceMetaData = tracer.getTraceHeaders();
    const newMetaData = { ...metadata, ...traceMetaData };
    await publisher.publish(notification, newMetaData);
  };

  return { ...publisher, publish };
};
