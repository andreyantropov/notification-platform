import { type Logger } from "@notification-platform/telemetry";

import { type Broker } from "../../../../createBroker/index.js";

export interface LoggingDependencies {
  readonly broker: Broker;
  readonly logger: Logger;
}
