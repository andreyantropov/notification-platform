import { type Logger } from "@notification-platform/telemetry";

import { type SendNotificationUseCase } from "../../../../../application/useCases/index.js";

export interface LoggingDecoratorDependencies {
  readonly sendNotificationUseCase: SendNotificationUseCase;
  readonly logger: Logger;
}
