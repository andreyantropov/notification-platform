import { type Meter } from "@notification-platform/telemetry";

import { type DeliveryService } from "../../../../../application/services/index.js";

export interface MetricsDecoratorDependencies {
  readonly deliveryService: DeliveryService;
  readonly meter: Meter;
}
