import { type Notification } from "@notification-platform/core";
import { type Meter } from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DispatchService } from "../../../../application/services/index.js";

import { type MetricsDependencies } from "./interfaces/index.js";
import { withMetrics } from "./withMetrics.js";

describe("withMetrics (DispatchService)", () => {
  let mockDispatchService: DispatchService;
  let mockMeter: Meter;

  const mockNotification: Notification = {
    id: "notif-1",
    message: "test",
    contacts: [],
    createdAt: new Date().toISOString(),
    initiator: { id: "1", name: "admin" },
    strategy: "custom_strategy",
  } as unknown as Notification;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    mockDispatchService = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    mockMeter = {
      add: vi.fn(),
      gauge: vi.fn(),
      increment: vi.fn(),
      record: vi.fn(),
    };
  });

  const getDeps = (): MetricsDependencies => ({
    dispatchService: mockDispatchService,
    meter: mockMeter,
  });

  it("should record error metrics and rethrow when dispatch fails", async () => {
    const error = new Error("Dispatch Error");
    vi.mocked(mockDispatchService.dispatch).mockRejectedValue(error);

    const decorated = withMetrics(getDeps());

    const promise = decorated.dispatch(mockNotification);
    vi.advanceTimersByTime(50);

    await expect(promise).rejects.toThrow(error);

    expect(mockMeter.increment).toHaveBeenCalledWith(
      "notifications_dispatched_total",
      {
        status: "error",
      },
    );

    expect(mockMeter.record).toHaveBeenCalledWith(
      "notifications_dispatched_duration_ms",
      50,
      { status: "error" },
    );
  });

  it("should preserve original service properties", () => {
    const complexService = {
      ...mockDispatchService,
      otherMethod: vi.fn(),
    } as unknown as DispatchService;

    const decorated = withMetrics({
      dispatchService: complexService,
      meter: mockMeter,
    });

    expect(decorated).toHaveProperty("otherMethod");
  });
});
