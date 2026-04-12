import { type Initiator, type Notification } from "@notification-platform/core";

import { type IncomingNotification } from "../../types/index.js";

import {
  type ReceiveNotificationUseCase,
  type ReceiveNotificationUseCaseDependencies,
} from "./interfaces/index.js";

export const createReceiveNotificationUseCase = (
  dependencies: ReceiveNotificationUseCaseDependencies,
): ReceiveNotificationUseCase => {
  const { enrichmentService, dispatchService } = dependencies;

  const execute = async (
    incomingNotification: IncomingNotification,
    initiator: Initiator,
  ): Promise<Notification> => {
    const notification = enrichmentService.enrich(
      incomingNotification,
      initiator,
    );

    await dispatchService.dispatch(notification);

    return notification;
  };

  return {
    execute,
  };
};
