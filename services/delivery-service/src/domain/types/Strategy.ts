import { type Notification } from "@notification-platform/core";

import { type Channel } from "../ports/index.js";

export type Strategy = (
  notification: Notification,
  channels: readonly Channel[],
) => Promise<void>;
