import { type Logger } from "@notification-platform/telemetry";

import { type Channel } from "../../../../../domain/ports/index.js";

export interface LoggingDecoratorDependencies {
  readonly channel: Channel;
  readonly logger: Logger;
}
