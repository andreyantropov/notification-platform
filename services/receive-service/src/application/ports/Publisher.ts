import { type Notification } from "@notification-platform/core";

export interface Publisher {
  readonly publish: (
    notification: Notification,
    metadata?: Record<string, string>,
  ) => Promise<void>;
  readonly checkHealth?: () => Promise<void>;
}
