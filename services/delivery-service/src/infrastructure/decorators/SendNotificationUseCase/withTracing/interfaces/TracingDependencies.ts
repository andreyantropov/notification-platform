import { type Tracer } from "@notification-platform/telemetry";

import { type SendNotificationUseCase } from "../../../../../application/useCases/index.js";

export interface TracingDependencies {
  readonly sendNotificationUseCase: SendNotificationUseCase;
  readonly tracer: Tracer;
}
