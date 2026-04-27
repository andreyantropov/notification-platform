import { type Meter } from "@notification-platform/telemetry";

import { type DeliveryService } from "../../../../../application/services/index.js";

export interface MetricsDependencies {
  readonly deliveryService: DeliveryService;
  readonly meter: Meter;
}
