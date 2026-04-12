import { type AMQPChannel } from "@cloudamqp/amqp-client";

import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

export interface ConsumerDependencies {
  readonly channelPromise: Promise<AMQPChannel>;
  readonly sendNotificationUseCase: SendNotificationUseCase;
}
