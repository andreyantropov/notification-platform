import { type Notification } from "@notification-platform/core";
import { type Meter } from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type Publisher } from "../../../../application/ports/index.js";

import { withMetrics } from "./withMetrics.js";

describe("withMetrics (Publisher)", () => {
  let mockPublisher: Mocked<Publisher>;
  let mockMeter: Mocked<Meter>;

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

    mockMeter = {
      increment: vi.fn(),
      record: vi.fn(),
    } as unknown as Mocked<Meter>;
  });

  const getDeps = () => ({
    publisher: mockPublisher,
    meter: mockMeter,
  });

  describe("publish", () => {
    it("should record success metrics and duration", async () => {
      mockPublisher.publish.mockImplementation(async () => {
        vi.advanceTimersByTime(250);
      });

      const decorated = withMetrics(getDeps());
      await decorated.publish(mockNotification, mockMetadata);

      expect(mockMeter.increment).toHaveBeenCalledWith(
        "notifications_published_total",
        { status: "success" },
      );

      expect(mockMeter.record).toHaveBeenCalledWith(
        "notifications_published_duration_ms",
        250,
        { status: "success" },
      );
    });

    it("should record error metrics when publisher fails", async () => {
      const error = new Error("Queue full");
      mockPublisher.publish.mockImplementation(async () => {
        vi.advanceTimersByTime(50);
        throw error;
      });

      const decorated = withMetrics(getDeps());

      await expect(decorated.publish(mockNotification)).rejects.toThrow(error);

      expect(mockMeter.increment).toHaveBeenCalledWith(
        "notifications_published_total",
        { status: "error" },
      );

      expect(mockMeter.record).toHaveBeenCalledWith(
        "notifications_published_duration_ms",
        50,
        { status: "error" },
      );
    });

    it("should pass all arguments to original publisher", async () => {
      const decorated = withMetrics(getDeps());
      await decorated.publish(mockNotification, mockMetadata);

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        mockNotification,
        mockMetadata,
      );
    });
  });

  it("should preserve other publisher methods", () => {
    const decorated = withMetrics(getDeps());

    expect(decorated.checkHealth).toBeDefined();
    expect(typeof decorated.checkHealth).toBe("function");
  });
});
