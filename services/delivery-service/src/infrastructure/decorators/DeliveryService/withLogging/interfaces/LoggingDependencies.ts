import { type Logger } from "@notification-platform/telemetry";

import { type DeliveryService } from "../../../../../application/services/index.js";

export interface LoggingDependencies {
  readonly deliveryService: DeliveryService;
  readonly logger: Logger;
}
