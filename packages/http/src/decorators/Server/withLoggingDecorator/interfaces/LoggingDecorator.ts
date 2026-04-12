import { type Logger } from "@notification-platform/telemetry";

import { type Server } from "../../../../server/index.js";

export interface LoggingDecoratorDependencies {
  readonly server: Server;
  readonly logger: Logger;
}
