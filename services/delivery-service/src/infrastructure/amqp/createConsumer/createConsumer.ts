import { type AMQPMessage } from "@cloudamqp/amqp-client";
import { type Notification } from "@notification-platform/core";

import {
  type Consumer,
  type ConsumerConfig,
  type ConsumerDependencies,
} from "./interfaces/index.js";
import { validateNotification } from "./utils/index.js";

export const createConsumer = (
  dependencies: ConsumerDependencies,
  config: ConsumerConfig,
): Consumer => {
  const { channelPromise, sendNotificationUseCase } = dependencies;
  const { queue, prefetchCount } = config;

  const consume = async (): Promise<void> => {
    const channel = await channelPromise;

    await channel.basicQos(prefetchCount);
    await channel.queueDeclare(queue, { passive: true });
    await channel.basicConsume(
      queue,
      { noAck: false },
      async (msg: AMQPMessage) => {
        if (msg.body === null) {
          await msg.ack();
          return;
        }

        const bodyStr = Buffer.from(msg.body).toString();
        const item: Notification = JSON.parse(bodyStr);
        const notificationValidationResult = validateNotification(item);

        if (!notificationValidationResult.success) {
          await msg.nack();
          return;
        }

        const headers = msg.properties?.headers ?? {};
        const notification = notificationValidationResult.data;

        try {
          await sendNotificationUseCase.execute(notification, headers);
          await msg.ack();
        } catch {
          await msg.nack();
        }
      },
    );
  };

  return { consume };
};
