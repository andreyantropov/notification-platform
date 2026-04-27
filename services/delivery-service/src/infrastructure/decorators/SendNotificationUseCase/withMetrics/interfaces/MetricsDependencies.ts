import { type Meter } from "@notification-platform/telemetry";

import { type SendNotificationUseCase } from "../../../../../application/useCases/index.js";

export interface MetricsDependencies {
  readonly sendNotificationUseCase: SendNotificationUseCase;
  readonly meter: Meter;
}
