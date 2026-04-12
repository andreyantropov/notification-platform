import { type Meter } from "@notification-platform/telemetry";

import { type Channel } from "../../../../../domain/ports/index.js";

export interface MetricsDecoratorDependencies {
  readonly channel: Channel;
  readonly meter: Meter;
}
