import { type Tracer } from "@notification-platform/telemetry";

import { type SendNotificationUseCase } from "../../../../../application/useCases/index.js";

export interface TracingDecoratorDependencies {
  readonly sendNotificationUseCase: SendNotificationUseCase;
  readonly tracer: Tracer;
}
