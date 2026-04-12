import { type Notification } from "@notification-platform/core";

export interface DeliveryService {
  readonly deliver: (notifications: Notification) => Promise<void>;
}
