import { type Meter } from "@notification-platform/telemetry";

import { type ReceiveNotificationUseCase } from "../../../../../application/useCases/index.js";

export interface MetricsDecoratorDependencies {
  readonly receiveNotificationUseCase: ReceiveNotificationUseCase;
  readonly meter: Meter;
}
