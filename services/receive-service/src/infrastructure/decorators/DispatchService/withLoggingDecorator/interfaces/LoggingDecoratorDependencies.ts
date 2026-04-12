import { type Logger } from "@notification-platform/telemetry";

import { type DispatchService } from "../../../../../application/services/index.js";

export interface LoggingDecoratorDependencies {
  readonly dispatchService: DispatchService;
  readonly logger: Logger;
}
