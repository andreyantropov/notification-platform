import { type Notification } from "@notification-platform/core";

export type IncomingNotification = Omit<
  Notification,
  "createdAt" | "id" | "initiator" | "strategy"
> & {
  readonly strategy?: Notification["strategy"];
};
