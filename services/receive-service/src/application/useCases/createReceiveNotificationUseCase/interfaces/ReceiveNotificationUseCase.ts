import { type Initiator, type Notification } from "@notification-platform/core";

import { type IncomingNotification } from "../../../types/index.js";

export interface ReceiveNotificationUseCase {
  readonly execute: (
    incomingNotification: IncomingNotification,
    initiator: Initiator,
  ) => Promise<Notification>;
}
