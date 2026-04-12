import { type Notification } from "@notification-platform/core";
import { type Meter } from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type MetaData } from "../../../../application/types/index.js";
import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

import { withMetricsDecorator } from "./withMetricsDecorator.js";

describe("withMetricsDecorator (SendNotificationUseCase)", () => {
  let mockUseCase: Mocked<SendNotificationUseCase>;
  let mockMeter: Mocked<Meter>;

  const mockNotification = {
    id: "notif-123",
  } as unknown as Notification;

  const mockMetadata: MetaData = { traceparent: "00-abc" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    mockUseCase = {
      execute: vi.fn(),
    };

    mockMeter = {
      increment: vi.fn(),
      record: vi.fn(),
    } as unknown as Mocked<Meter>;
  });

  const getDeps = () => ({
    sendNotificationUseCase: mockUseCase,
    meter: mockMeter,
  });

  describe("execute", () => {
    it("should record success metrics with duration", async () => {
      mockUseCase.execute.mockImplementation(async () => {
        vi.advanceTimersByTime(450);
      });

      const decorated = withMetricsDecorator(getDeps());
      await decorated.execute(mockNotification, mockMetadata);

      expect(mockMeter.increment).toHaveBeenCalledWith(
        "notifications_consumed_total",
        { status: "success" },
      );

      expect(mockMeter.record).toHaveBeenCalledWith(
        "notifications_consumed_duration_ms",
        450,
        { status: "success" },
      );

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        mockNotification,
        mockMetadata,
      );
    });

    it("should record error metrics when execution fails", async () => {
      const error = new Error("Execution failed");
      mockUseCase.execute.mockImplementation(async () => {
        vi.advanceTimersByTime(100);
        throw error;
      });

      const decorated = withMetricsDecorator(getDeps());

      await expect(decorated.execute(mockNotification)).rejects.toThrow(error);

      expect(mockMeter.increment).toHaveBeenCalledWith(
        "notifications_consumed_total",
        { status: "error" },
      );

      expect(mockMeter.record).toHaveBeenCalledWith(
        "notifications_consumed_duration_ms",
        100,
        { status: "error" },
      );
    });
  });

  it("should preserve all use case methods", () => {
    const complexUseCase = {
      execute: vi.fn(),
      otherMethod: vi.fn(),
    } as unknown as SendNotificationUseCase;

    const decorated = withMetricsDecorator({
      sendNotificationUseCase: complexUseCase,
      meter: mockMeter,
    });

    expect(decorated).toHaveProperty("otherMethod");
  });
});
