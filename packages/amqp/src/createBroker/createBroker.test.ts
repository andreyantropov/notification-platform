import { type AMQPChannel, AMQPClient } from "@cloudamqp/amqp-client";
import { type AMQPBaseClient } from "@cloudamqp/amqp-client/amqp-base-client";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { createBroker } from "./createBroker.js";

vi.mock("@cloudamqp/amqp-client", () => {
  return {
    AMQPClient: vi.fn(),
    AMQPChannel: vi.fn(),
  };
});

describe("createBroker", () => {
  const config = { url: "amqp://localhost" };

  let mockConnection: Mocked<AMQPBaseClient>;
  let mockClient: Mocked<AMQPClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConnection = {
      channel: vi.fn(),
      close: vi.fn(),
    } as unknown as Mocked<AMQPBaseClient>;

    mockClient = {
      connect: vi.fn().mockResolvedValue(mockConnection),
    } as unknown as Mocked<AMQPClient>;

    (AMQPClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient,
    );
  });

  describe("start", () => {
    it("should connect to the client successfully", async () => {
      const broker = createBroker(config);
      await broker.start();

      expect(mockClient.connect).toHaveBeenCalledTimes(1);
    });

    it("should not try to connect if already starting", async () => {
      const broker = createBroker(config);
      const firstCall = broker.start();
      const secondCall = broker.start();

      await Promise.all([firstCall, secondCall]);
      expect(mockClient.connect).toHaveBeenCalledTimes(1);
    });

    it("should clean up connection if connect fails", async () => {
      const error = new Error("Connection failed");
      mockClient.connect.mockRejectedValueOnce(error);

      const broker = createBroker(config);
      await expect(broker.start()).rejects.toThrow(error);
    });
  });

  describe("createChannel", () => {
    it("should throw error if broker is not started", async () => {
      const broker = createBroker(config);
      await expect(broker.createChannel()).rejects.toThrow(
        "Не удалось создать канал",
      );
    });

    it("should return a channel with confirmSelect enabled", async () => {
      const mockChannel = {
        confirmSelect: vi.fn(),
      } as unknown as Mocked<AMQPChannel>;

      mockConnection.channel.mockResolvedValueOnce(mockChannel);

      const broker = createBroker(config);
      await broker.start();
      const channel = await broker.createChannel();

      expect(mockConnection.channel).toHaveBeenCalled();
      expect(mockChannel.confirmSelect).toHaveBeenCalled();
      expect(channel).toBe(mockChannel);
    });
  });

  describe("closeChannel", () => {
    it("should throw error if channel belongs to another connection", async () => {
      const broker = createBroker(config);
      await broker.start();

      const foreignChannel = {
        connection: {} as AMQPBaseClient,
        close: vi.fn(),
      } as unknown as AMQPChannel;

      await expect(broker.closeChannel(foreignChannel)).rejects.toThrow(
        "канал не принадлежит этому брокеру",
      );
    });

    it("should close channel successfully", async () => {
      const broker = createBroker(config);
      await broker.start();

      const mockChannel = {
        connection: mockConnection,
        close: vi.fn(),
      } as unknown as AMQPChannel;

      await broker.closeChannel(mockChannel);
      expect(mockChannel.close).toHaveBeenCalled();
    });
  });

  describe("shutdown", () => {
    it("should close connection on shutdown", async () => {
      const broker = createBroker(config);
      await broker.start();
      await broker.shutdown();

      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it("should do nothing if connection does not exist", async () => {
      const broker = createBroker(config);
      await broker.shutdown();
      expect(mockConnection.close).not.toHaveBeenCalled();
    });
  });
});
