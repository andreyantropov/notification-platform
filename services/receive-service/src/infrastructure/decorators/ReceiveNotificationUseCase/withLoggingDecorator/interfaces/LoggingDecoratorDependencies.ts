import { type Logger } from "@notification-platform/telemetry";

import { type ReceiveNotificationUseCase } from "../../../../../application/useCases/index.js";

export interface LoggingDecoratorDependencies {
  readonly receiveNotificationUseCase: ReceiveNotificationUseCase;
  readonly logger: Logger;
}
