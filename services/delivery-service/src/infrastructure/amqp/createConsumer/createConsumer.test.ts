import { type AMQPChannel, type AMQPMessage } from "@cloudamqp/amqp-client";
import { type Notification } from "@notification-platform/core";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type SendNotificationUseCase } from "../../../application/useCases/index.js";

import { createConsumer } from "./createConsumer.js";
import { validateNotification } from "./utils/index.js";

type DeepWritable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepWritable<T[P]> : T[P];
};

vi.mock("./utils/index.js", () => ({
  validateNotification: vi.fn(),
}));

describe("createConsumer", () => {
  let mockChannel: Mocked<AMQPChannel>;
  let channelPromise: Promise<AMQPChannel>;
  let mockUseCase: Mocked<SendNotificationUseCase>;
  let mockMessage: Mocked<AMQPMessage>;

  const config = {
    queue: "notifications-queue",
    prefetchCount: 5,
  };

  const mockNotificationData = {
    id: "notif-123",
    createdAt: "2024-01-01T00:00:00Z",
    contacts: [],
    message: "Hello world",
    strategy: "send_to_all_available" as const,
    initiator: { id: "user-1", name: "System" },
  };

  const mockNotification = mockNotificationData as unknown as Notification;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChannel = {
      basicQos: vi.fn().mockResolvedValue(undefined),
      queueDeclare: vi.fn().mockResolvedValue({}),
      basicConsume: vi.fn(),
    } as unknown as Mocked<AMQPChannel>;

    channelPromise = Promise.resolve(mockChannel);

    mockUseCase = { execute: vi.fn() };

    mockMessage = {
      body: Uint8Array.from(Buffer.from(JSON.stringify(mockNotification))),
      properties: { headers: { "x-retry-count": "1" } },
      ack: vi.fn().mockResolvedValue(undefined),
      nack: vi.fn().mockResolvedValue(undefined),
    } as unknown as Mocked<AMQPMessage>;
  });

  const extractHandler = async () => {
    const consumer = createConsumer(
      {
        channelPromise,
        sendNotificationUseCase: mockUseCase,
      },
      config,
    );

    await consumer.consume();

    const calls = (mockChannel.basicConsume as ReturnType<typeof vi.fn>).mock
      .calls;
    const handler = calls[0]?.[2] as (msg: AMQPMessage) => Promise<void>;

    if (!handler) throw new Error("Handler not found");
    return handler;
  };

  describe("message processing", () => {
    it("should successfully process and ack valid notification", async () => {
      const handler = await extractHandler();

      const validData = mockNotificationData as DeepWritable<Notification>;

      vi.mocked(validateNotification).mockReturnValue({
        success: true,
        data: validData,
      } as ReturnType<typeof validateNotification>);

      await handler(mockMessage);

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        mockNotification,
        mockMessage.properties?.headers,
      );
      expect(mockMessage.ack).toHaveBeenCalled();
    });

    it("should nack if use case execution throws error", async () => {
      const handler = await extractHandler();

      vi.mocked(validateNotification).mockReturnValue({
        success: true,
        data: mockNotificationData as DeepWritable<Notification>,
      } as ReturnType<typeof validateNotification>);

      mockUseCase.execute.mockRejectedValue(new Error("Failed"));

      await handler(mockMessage);

      expect(mockMessage.nack).toHaveBeenCalled();
    });

    it("should nack if validation fails", async () => {
      const handler = await extractHandler();

      vi.mocked(validateNotification).mockReturnValue({
        success: false,
        error: new Error("Invalid format"),
      } as ReturnType<typeof validateNotification>);

      await handler(mockMessage);

      expect(mockMessage.nack).toHaveBeenCalled();
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
