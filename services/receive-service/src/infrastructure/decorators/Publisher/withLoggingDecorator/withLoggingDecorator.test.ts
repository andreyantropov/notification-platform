import { type Notification } from "@notification-platform/core";
import {
  EVENT_TYPE,
  type Logger,
  TRIGGER_TYPE,
} from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type Publisher } from "../../../../application/ports/index.js";

import { withLoggingDecorator } from "./withLoggingDecorator.js";

describe("withLoggingDecorator (Publisher)", () => {
  let mockPublisher: Mocked<Publisher>;
  let mockLogger: Mocked<Logger>;

  const mockNotification = {
    id: "notif-123",
  } as unknown as Notification;

  const mockMetadata = { "x-trace-id": "abc" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    mockPublisher = {
      publish: vi.fn(),
      checkHealth: vi.fn(),
    } as unknown as Mocked<Publisher>;

    mockLogger = {
      trace: vi.fn().mockResolvedValue(undefined),
      debug: vi.fn().mockResolvedValue(undefined),
      info: vi.fn().mockResolvedValue(undefined),
      warn: vi.fn().mockResolvedValue(undefined),
      error: vi.fn().mockResolvedValue(undefined),
      fatal: vi.fn().mockResolvedValue(undefined),
    };
  });

  const getDeps = () => ({
    publisher: mockPublisher,
    logger: mockLogger,
  });

  describe("publish", () => {
    it("should log success with eventName and pass metadata to the publisher", async () => {
      mockPublisher.publish.mockImplementation(async () => {
        vi.advanceTimersByTime(200);
      });

      const decorated = withLoggingDecorator(getDeps());
      await decorated.publish(mockNotification, mockMetadata);

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        mockNotification,
        mockMetadata,
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Уведомление успешно опубликовано",
          eventName: "notification.publish",
          durationMs: 200,
          eventType: EVENT_TYPE.MESSAGING,
          trigger: TRIGGER_TYPE.API,
          details: { id: mockNotification.id },
        }),
      );
    });

    it("should log error and rethrow with eventName when publisher fails", async () => {
      const error = new Error("RabbitMQ connection error");
      mockPublisher.publish.mockImplementation(async () => {
        vi.advanceTimersByTime(10);
        throw error;
      });

      const decorated = withLoggingDecorator(getDeps());

      await expect(decorated.publish(mockNotification)).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Не удалось опубликовать уведомление",
          eventName: "notification.publish",
          durationMs: 10,
          error,
          details: { id: mockNotification.id },
        }),
      );
    });
  });

  it("should preserve checkHealth method from original publisher", () => {
    const decorated = withLoggingDecorator(getDeps());

    expect(decorated.checkHealth).toBeDefined();
    expect(typeof decorated.checkHealth).toBe("function");
  });
});
