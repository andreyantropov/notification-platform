import { type Meter } from "@notification-platform/telemetry";

import { type ReceiveNotificationBatchUseCase } from "../../../../../application/useCases/index.js";

export interface MetricsDependencies {
  readonly receiveNotificationBatchUseCase: ReceiveNotificationBatchUseCase;
  readonly meter: Meter;
}
