import { type AMQPChannel } from "@cloudamqp/amqp-client";
import { type Notification } from "@notification-platform/core";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { PERSISTENT } from "./constants/index.js";
import { createPublisher } from "./createPublisher.js";

vi.mock("p-timeout", () => ({
  default: vi.fn((promise) => promise),
}));

import pTimeout from "p-timeout";

describe("createPublisher", () => {
  let mockChannel: Mocked<AMQPChannel>;
  let channelPromise: Promise<AMQPChannel>;

  const config = {
    exchange: "test-exchange",
    routingKey: "test-key",
    timeoutMs: 1000,
  };

  const mockNotification = {
    id: "123",
    message: "hello",
  } as unknown as Notification;
  const mockMetadata = { "x-trace-id": "abc" };

  beforeEach(() => {
    vi.clearAllMocks();

    mockChannel = {
      basicPublish: vi.fn().mockResolvedValue(undefined),
      queueDeclare: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<AMQPChannel>;

    channelPromise = Promise.resolve(mockChannel);
  });

  describe("publish", () => {
    it("should call basicPublish with correct arguments and persistence", async () => {
      const publisher = createPublisher({ channelPromise }, config);
      const expectedPayload = Buffer.from(
        JSON.stringify(mockNotification),
        "utf8",
      );

      await publisher.publish(mockNotification, mockMetadata);

      expect(mockChannel.basicPublish).toHaveBeenCalledWith(
        config.exchange,
        config.routingKey,
        expectedPayload,
        {
          deliveryMode: PERSISTENT,
          headers: mockMetadata,
        },
      );
    });

    it("should wrap basicPublish call with pTimeout and correct timeoutMs", async () => {
      const publisher = createPublisher({ channelPromise }, config);

      await publisher.publish(mockNotification);

      expect(pTimeout).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          milliseconds: config.timeoutMs,
          message: "Превышено время ожидания ответа от брокера",
        }),
      );
    });
  });

  describe("checkHealth", () => {
    it("should call queueDeclare with passive: true", async () => {
      const publisher = createPublisher({ channelPromise }, config);

      await publisher.checkHealth!();

      expect(mockChannel.queueDeclare).toHaveBeenCalledWith(config.routingKey, {
        passive: true,
      });
    });

    it("should wrap health check with timeout", async () => {
      const publisher = createPublisher({ channelPromise }, config);

      await publisher.checkHealth!();

      expect(pTimeout).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          milliseconds: config.timeoutMs,
        }),
      );
    });

    it("should rethrow pTimeout error if health check fails", async () => {
      const timeoutError = new Error("Timeout");
      vi.mocked(pTimeout).mockRejectedValueOnce(timeoutError);

      const publisher = createPublisher({ channelPromise }, config);

      await expect(publisher.checkHealth!()).rejects.toThrow("Timeout");
    });
  });
});
