import { type Notification } from "@notification-platform/core";
import { type Tracer } from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type MetaData } from "../../../../application/types/index.js";
import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

import { TRACE_KEYS } from "./constants/index.js";
import { type TracingDecoratorDependencies } from "./interfaces/index.js";
import { withTracingDecorator } from "./withTracingDecorator.js";

describe("withTracingDecorator (SendNotificationUseCase)", () => {
  let mockUseCase: SendNotificationUseCase;
  let mockTracer: Tracer;

  const mockNotification = {
    id: "notif-123",
  } as unknown as Notification;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTracer = {
      startActiveSpan: vi.fn().mockImplementation((_name, fn) => fn()),
      continueTrace: vi.fn().mockImplementation((_headers, fn) => fn()),
      getTraceHeaders: vi.fn().mockReturnValue({}),
    };

    mockUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as SendNotificationUseCase;
  });

  const getDeps = (): TracingDecoratorDependencies => ({
    sendNotificationUseCase: mockUseCase,
    tracer: mockTracer,
  });

  describe("execute", () => {
    it("should extract trace headers and call continueTrace", async () => {
      const [tpKey, tsKey] = TRACE_KEYS;
      const metadata: MetaData = {
        [tpKey]: "00-trace-id",
        [tsKey]: "state-data",
        "other-header": "ignore",
      };

      const decorated = withTracingDecorator(getDeps());
      await decorated.execute(mockNotification, metadata);

      expect(vi.mocked(mockTracer.continueTrace)).toHaveBeenCalledWith(
        {
          [tpKey]: "00-trace-id",
          [tsKey]: "state-data",
        },
        expect.any(Function),
      );

      expect(vi.mocked(mockUseCase.execute)).toHaveBeenCalledWith(
        mockNotification,
        metadata,
      );
    });

    it("should call continueTrace with empty object if no metadata provided", async () => {
      const decorated = withTracingDecorator(getDeps());
      await decorated.execute(mockNotification);

      expect(vi.mocked(mockTracer.continueTrace)).toHaveBeenCalledWith(
        {},
        expect.any(Function),
      );
    });

    it("should propagate errors from the underlying use case", async () => {
      const error = new Error("Execution failed");
      vi.mocked(mockUseCase.execute).mockRejectedValue(error);

      const decorated = withTracingDecorator(getDeps());

      await expect(decorated.execute(mockNotification)).rejects.toThrow(error);
      expect(vi.mocked(mockTracer.continueTrace)).toHaveBeenCalled();
    });
  });
});
