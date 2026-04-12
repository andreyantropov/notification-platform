import { type Logger } from "@notification-platform/telemetry";

import { type ReceiveNotificationBatchUseCase } from "../../../../../application/useCases/index.js";

export interface LoggingDecoratorDependencies {
  readonly receiveNotificationBatchUseCase: ReceiveNotificationBatchUseCase;
  readonly logger: Logger;
}
