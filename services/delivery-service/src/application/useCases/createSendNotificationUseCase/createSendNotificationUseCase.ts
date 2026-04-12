/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Notification } from "@notification-platform/core";

import { type MetaData } from "../../types/index.js";

import {
  type SendNotificationUseCase,
  type SendNotificationUseCaseDependencies,
} from "./interfaces/index.js";

export const createSendNotificationUseCase = (
  dependencies: SendNotificationUseCaseDependencies,
): SendNotificationUseCase => {
  const { deliveryService } = dependencies;

  const execute = async (
    notification: Notification,
    metadata?: MetaData,
  ): Promise<void> => {
    await deliveryService.deliver(notification);
  };

  return { execute };
};
