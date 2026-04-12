import { type AMQPChannel } from "@cloudamqp/amqp-client";

export interface PublisherDependencies {
  readonly channelPromise: Promise<AMQPChannel>;
}
