import { type Logger } from "@notification-platform/telemetry";

import { type DispatchService } from "../../../../../application/services/index.js";

export interface LoggingDependencies {
  readonly dispatchService: DispatchService;
  readonly logger: Logger;
}
