import { type Notification } from "@notification-platform/core";
import { type Tracer } from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type Publisher } from "../../../../application/ports/index.js";

import { withTracingDecorator } from "./withTracingDecorator.js";

describe("withTracingDecorator (Publisher)", () => {
  let mockPublisher: Mocked<Publisher>;
  let mockTracer: Mocked<Tracer>;

  const mockNotification = {
    id: "notif-123",
  } as unknown as Notification;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPublisher = {
      publish: vi.fn(),
      checkHealth: vi.fn(),
    } as unknown as Mocked<Publisher>;

    mockTracer = {
      getTraceHeaders: vi.fn(),
    } as unknown as Mocked<Tracer>;
  });

  const getDeps = () => ({
    publisher: mockPublisher,
    tracer: mockTracer,
  });

  describe("publish", () => {
    it("should merge existing metadata with trace headers", async () => {
      const existingMetadata = { "x-custom-header": "custom-value" };
      const traceHeaders = {
        traceparent: "00-trace-id-123",
        tracestate: "state-abc",
      };

      mockTracer.getTraceHeaders.mockReturnValue(traceHeaders);

      const decorated = withTracingDecorator(getDeps());
      await decorated.publish(mockNotification, existingMetadata);

      expect(mockPublisher.publish).toHaveBeenCalledWith(mockNotification, {
        "x-custom-header": "custom-value",
        traceparent: "00-trace-id-123",
        tracestate: "state-abc",
      });
    });

    it("should work correctly when metadata is undefined", async () => {
      const traceHeaders = { traceparent: "only-trace" };
      mockTracer.getTraceHeaders.mockReturnValue(traceHeaders);

      const decorated = withTracingDecorator(getDeps());
      await decorated.publish(mockNotification);

      expect(mockPublisher.publish).toHaveBeenCalledWith(mockNotification, {
        traceparent: "only-trace",
      });
    });

    it("should override existing metadata keys if they collide with trace headers", async () => {
      const existingMetadata = { traceparent: "old-trace" };
      const traceHeaders = { traceparent: "new-trace" };

      mockTracer.getTraceHeaders.mockReturnValue(traceHeaders);

      const decorated = withTracingDecorator(getDeps());
      await decorated.publish(mockNotification, existingMetadata);

      expect(mockPublisher.publish).toHaveBeenCalledWith(mockNotification, {
        traceparent: "new-trace",
      });
    });
  });

  it("should preserve publisher methods other than publish", () => {
    const decorated = withTracingDecorator(getDeps());

    expect(decorated.checkHealth).toBeDefined();
    expect(typeof decorated.checkHealth).toBe("function");
  });
});
