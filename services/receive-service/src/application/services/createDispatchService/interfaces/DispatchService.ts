import { type Notification } from "@notification-platform/core";

export interface DispatchService {
  readonly dispatch: (notification: Notification) => Promise<void>;
}
