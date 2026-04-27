import { type Notification } from "@notification-platform/core";

import { type MetaData } from "../../../../application/types/index.js";
import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

import { RETRY_COUNT_KEY } from "./constants/index.js";
import { type RetryDependencies } from "./interfaces/index.js";

export const withRetry = (
  dependencies: RetryDependencies,
): SendNotificationUseCase => {
  const { sendNotificationUseCase } = dependencies;

  const execute = async (
    notification: Notification,
    metadata?: MetaData,
  ): Promise<void> => {
    const currentRetryCount = Number(metadata?.[RETRY_COUNT_KEY]) || 0;

    const newMetadata: MetaData = {
      ...metadata,
      [RETRY_COUNT_KEY]: (currentRetryCount + 1).toString(),
    };

    await sendNotificationUseCase.execute(notification, newMetadata);
  };

  return { ...sendNotificationUseCase, execute };
};
