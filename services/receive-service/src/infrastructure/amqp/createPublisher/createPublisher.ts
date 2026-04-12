import { type Notification } from "@notification-platform/core";
import pTimeout from "p-timeout";

import { type Publisher } from "../../../application/ports/index.js";

import { PERSISTENT } from "./constants/index.js";
import {
  type PublisherConfig,
  type PublisherDependencies,
} from "./interfaces/index.js";

export const createPublisher = (
  dependencies: PublisherDependencies,
  config: PublisherConfig,
): Publisher => {
  const { channelPromise } = dependencies;
  const { exchange, routingKey, timeoutMs } = config;

  const publish = async (
    notification: Notification,
    metadata?: Record<string, string>,
  ): Promise<void> => {
    const channel = await channelPromise;

    const payload = Buffer.from(JSON.stringify(notification), "utf8");

    await pTimeout(
      channel.basicPublish(exchange, routingKey, payload, {
        deliveryMode: PERSISTENT,
        headers: metadata,
      }),
      {
        milliseconds: timeoutMs,
        message: "Превышено время ожидания ответа от брокера",
      },
    );
  };

  const checkHealth = async (): Promise<void> => {
    const channel = await channelPromise;

    await pTimeout(channel.queueDeclare(routingKey, { passive: true }), {
      milliseconds: timeoutMs,
      message: "Превышено время ожидания ответа от брокера",
    });
  };

  return { publish, checkHealth };
};
