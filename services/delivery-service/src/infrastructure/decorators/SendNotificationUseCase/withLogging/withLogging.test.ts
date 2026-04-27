import { type Notification } from "@notification-platform/core";
import {
  EVENT_TYPE,
  type Logger,
  TRIGGER_TYPE,
} from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type MetaData } from "../../../../application/types/index.js";
import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

import { withLogging } from "./withLogging.js";

describe("withLogging (SendNotificationUseCase)", () => {
  let mockUseCase: Mocked<SendNotificationUseCase>;
  let mockLogger: Mocked<Logger>;

  const mockNotification = {
    id: "notif-123",
  } as unknown as Notification;

  const mockMetadata: MetaData = { "x-trace-id": "abc" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    mockUseCase = {
      execute: vi.fn(),
    };

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
    sendNotificationUseCase: mockUseCase,
    logger: mockLogger,
  });

  describe("execute", () => {
    it("should log info with correct duration and eventName when execution succeeds", async () => {
      mockUseCase.execute.mockImplementation(async () => {
        vi.advanceTimersByTime(300);
      });

      const decorated = withLogging(getDeps());
      await decorated.execute(mockNotification, mockMetadata);

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        mockNotification,
        mockMetadata,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Уведомление успешно отправлено",
          eventName: "notification.send",
          durationMs: 300,
          eventType: EVENT_TYPE.MESSAGING,
          trigger: TRIGGER_TYPE.QUEUE,
          details: { id: mockNotification.id },
        }),
      );
    });

    it("should log error and rethrow with eventName when execution fails", async () => {
      const error = new Error("Provider error");
      mockUseCase.execute.mockImplementation(async () => {
        vi.advanceTimersByTime(50);
        throw error;
      });

      const decorated = withLogging(getDeps());

      await expect(decorated.execute(mockNotification)).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Не удалось отправить уведомление",
          eventName: "notification.send",
          durationMs: 50,
          error,
          details: { id: mockNotification.id },
        }),
      );
    });
  });

  it("should preserve other use case methods if they exist", () => {
    const complexUseCase = {
      execute: vi.fn(),
      otherMethod: vi.fn(),
    } as unknown as SendNotificationUseCase;

    const decorated = withLogging({
      sendNotificationUseCase: complexUseCase,
      logger: mockLogger,
    });

    expect(decorated).toHaveProperty("otherMethod");
  });
});
