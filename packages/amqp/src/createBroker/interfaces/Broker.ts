import { type AMQPChannel } from "@cloudamqp/amqp-client";

export interface Broker {
  readonly start: () => Promise<void>;
  readonly createChannel: () => Promise<AMQPChannel>;
  readonly closeChannel: (channel: AMQPChannel) => Promise<void>;
  readonly shutdown: () => Promise<void>;
}
