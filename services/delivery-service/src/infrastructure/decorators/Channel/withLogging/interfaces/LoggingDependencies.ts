import { type Logger } from "@notification-platform/telemetry";

import { type Channel } from "../../../../../domain/ports/index.js";

export interface LoggingDependencies {
  readonly channel: Channel;
  readonly logger: Logger;
}
