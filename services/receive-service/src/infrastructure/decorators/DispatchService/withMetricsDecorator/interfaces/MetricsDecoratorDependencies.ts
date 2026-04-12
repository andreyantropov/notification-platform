import { type Meter } from "@notification-platform/telemetry";

import { type DispatchService } from "../../../../../application/services/index.js";

export interface MetricsDecoratorDependencies {
  readonly dispatchService: DispatchService;
  readonly meter: Meter;
}
