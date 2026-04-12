import { type Initiator, type Notification } from "@notification-platform/core";

import { type IncomingNotification } from "../../../types/index.js";

export interface EnrichmentService {
  readonly enrich: (
    incomingNotification: IncomingNotification,
    initiator: Initiator,
  ) => Notification;
}
