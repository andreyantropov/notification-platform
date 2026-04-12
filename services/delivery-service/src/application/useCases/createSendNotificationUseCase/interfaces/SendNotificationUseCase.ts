import { type Notification } from "@notification-platform/core";

import { type MetaData } from "../../../types/index.js";

export interface SendNotificationUseCase {
  execute: (notification: Notification, metadata?: MetaData) => Promise<void>;
}
