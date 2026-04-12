import { type Meter } from "@notification-platform/telemetry";

import { type Publisher } from "../../../../../application/ports/index.js";

export interface MetricsDecoratorDependencies {
  readonly publisher: Publisher;
  readonly meter: Meter;
}
