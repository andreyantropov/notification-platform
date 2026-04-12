import { type Notification } from "@notification-platform/core";
import {
  EVENT_TYPE,
  type Logger,
  TRIGGER_TYPE,
} from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DispatchService } from "../../../../application/services/index.js";

import { type LoggingDecoratorDependencies } from "./interfaces/index.js";
import { withLoggingDecorator } from "./withLoggingDecorator.js";

describe("withLoggingDecorator (DispatchService)", () => {
  let mockDispatchService: DispatchService;
  let mockLogger: Logger;

  const mockNotification = {
    id: "notif-123",
    strategy: "send_to_all_available",
  } as unknown as Notification;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    mockDispatchService = {
      dispatch: vi.fn(),
    } as unknown as DispatchService;

    mockLogger = {
      trace: vi.fn().mockResolvedValue(undefined),
      debug: vi.fn().mockResolvedValue(undefined),
      info: vi.fn().mockResolvedValue(undefined),
      warn: vi.fn().mockResolvedValue(undefined),
      error: vi.fn().mockResolvedValue(undefined),
      fatal: vi.fn().mockResolvedValue(undefined),
    };
  });

  const getDeps = (): LoggingDecoratorDependencies => ({
    dispatchService: mockDispatchService,
    logger: mockLogger,
  });

  it("should log info with correct eventName and duration when dispatch succeeds", async () => {
    vi.mocked(mockDispatchService.dispatch).mockImplementation(async () => {
      vi.advanceTimersByTime(150);
    });

    const decorated = withLoggingDecorator(getDeps());
    await decorated.dispatch(mockNotification);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Уведомление успешно опубликовано",
        eventName: "notification.dispatch",
        durationMs: 150,
        eventType: EVENT_TYPE.MESSAGING,
        trigger: TRIGGER_TYPE.API,
        details: { id: mockNotification.id },
      }),
    );
  });

  it("should log error and rethrow with eventName when dispatch fails", async () => {
    const error = new Error("Provider down");
    vi.mocked(mockDispatchService.dispatch).mockImplementation(async () => {
      vi.advanceTimersByTime(50);
      throw error;
    });

    const decorated = withLoggingDecorator(getDeps());

    await expect(decorated.dispatch(mockNotification)).rejects.toThrow(error);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Не удалось опубликовать уведомление",
        eventName: "notification.dispatch",
        durationMs: 50,
        error,
        details: { id: mockNotification.id },
      }),
    );
  });

  it("should preserve other service methods", () => {
    const complexService = {
      dispatch: vi.fn(),
      otherMethod: vi.fn(),
    } as unknown as DispatchService;

    const decorated = withLoggingDecorator({
      dispatchService: complexService,
      logger: mockLogger,
    });

    expect(decorated).toHaveProperty("otherMethod");
  });
});
