import { type Logger } from "@notification-platform/telemetry";

import { type Broker } from "../../../../createBroker/index.js";

export interface LoggingDecoratorDependencies {
  readonly broker: Broker;
  readonly logger: Logger;
}
