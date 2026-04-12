import { type Notification } from "@notification-platform/core";

import {
  type DispatchService,
  type DispatchServiceDependencies,
} from "./interfaces/index.js";

export const createDispatchService = (
  dependencies: DispatchServiceDependencies,
): DispatchService => {
  const { publisher } = dependencies;

  const dispatch = async (notification: Notification): Promise<void> => {
    await publisher.publish(notification);
  };

  return { dispatch };
};
