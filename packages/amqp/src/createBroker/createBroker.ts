import { type AMQPChannel, AMQPClient } from "@cloudamqp/amqp-client";
import { type AMQPBaseClient } from "@cloudamqp/amqp-client/amqp-base-client";

import { type Broker, type BrokerConfig } from "./interfaces/index.js";

export const createBroker = (config: BrokerConfig): Broker => {
  const { url } = config;
  const client = new AMQPClient(url);

  let connection: AMQPBaseClient | null = null;
  let isStarting = false;
  let isShuttingDown = false;

  const start = async (): Promise<void> => {
    if (isStarting || isShuttingDown || connection) {
      return;
    }

    isStarting = true;

    try {
      connection = await client.connect();
    } catch (error) {
      if (connection) {
        await connection.close();
        connection = null;
      }

      throw error;
    } finally {
      isStarting = false;
    }
  };

  const createChannel = async (): Promise<AMQPChannel> => {
    if (!connection) {
      throw new Error("Не удалось создать канал - брокер не был запущен");
    }

    const channel = await connection.channel();
    await channel.confirmSelect();

    return channel;
  };

  const closeChannel = async (channel: AMQPChannel): Promise<void> => {
    if (!connection) {
      throw new Error("Не удалось закрыть канал - брокер не был запущен");
    }

    if (channel.connection !== connection) {
      throw new Error(
        "Не удалось закрыть канал - канал не принадлежит этому брокеру",
      );
    }

    await channel.close();
  };

  const shutdown = async (): Promise<void> => {
    if (isStarting || isShuttingDown || !connection) {
      return;
    }

    isShuttingDown = true;

    try {
      await connection.close();
      connection = null;
    } finally {
      isShuttingDown = false;
    }
  };

  return { start, createChannel, closeChannel, shutdown };
};
