import { type Meter } from "@notification-platform/telemetry";

import { type ReceiveNotificationBatchUseCase } from "../../../../../application/useCases/index.js";

export interface MetricsDecoratorDependencies {
  readonly receiveNotificationBatchUseCase: ReceiveNotificationBatchUseCase;
  readonly meter: Meter;
}
