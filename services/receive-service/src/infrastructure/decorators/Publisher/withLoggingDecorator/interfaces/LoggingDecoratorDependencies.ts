import { type Logger } from "@notification-platform/telemetry";

import { type Publisher } from "../../../../../application/ports/index.js";

export interface LoggingDecoratorDependencies {
  readonly publisher: Publisher;
  readonly logger: Logger;
}
