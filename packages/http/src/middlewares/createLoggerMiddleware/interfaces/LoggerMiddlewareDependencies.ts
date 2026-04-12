import { type Logger } from "@notification-platform/telemetry";

export interface LoggerMiddlewareDependencies {
  readonly logger: Logger;
}
