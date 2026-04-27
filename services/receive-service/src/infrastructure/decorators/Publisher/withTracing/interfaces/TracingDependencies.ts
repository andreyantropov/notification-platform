import { type Tracer } from "@notification-platform/telemetry";

import { type Publisher } from "../../../../../application/ports/index.js";

export interface TracingDependencies {
  readonly publisher: Publisher;
  readonly tracer: Tracer;
}
