import { type Notification } from "@notification-platform/core";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type MetaData } from "../../../../application/types/index.js";
import { type SendNotificationUseCase } from "../../../../application/useCases/index.js";

import { RETRY_COUNT_KEY } from "./constants/index.js";
import { withRetry } from "./withRetry.js";

describe("withRetry", () => {
  let mockUseCase: Mocked<SendNotificationUseCase>;

  const mockNotification = {
    id: "notif-123",
  } as unknown as Notification;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
  });

  const getDeps = () => ({
    sendNotificationUseCase: mockUseCase,
  });

  describe("execute", () => {
    it("should set retry count to 1 if no metadata is provided", async () => {
      const decorated = withRetry(getDeps());
      await decorated.execute(mockNotification);

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        mockNotification,
        expect.objectContaining({
          [RETRY_COUNT_KEY]: "1",
        }),
      );
    });

    it("should increment existing retry count", async () => {
      const metadata: MetaData = {
        [RETRY_COUNT_KEY]: "2",
        "x-other-header": "value",
      };

      const decorated = withRetry(getDeps());
      await decorated.execute(mockNotification, metadata);

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        mockNotification,
        expect.objectContaining({
          [RETRY_COUNT_KEY]: "3",
          "x-other-header": "value",
        }),
      );
    });

    it("should handle invalid retry count value by resetting to 1", async () => {
      const metadata: MetaData = {
        [RETRY_COUNT_KEY]: "invalid",
      };

      const decorated = withRetry(getDeps());
      await decorated.execute(mockNotification, metadata);

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        mockNotification,
        expect.objectContaining({
          [RETRY_COUNT_KEY]: "1",
        }),
      );
    });

    it("should rethrow error if use case execution fails", async () => {
      const error = new Error("Execution failed");
      mockUseCase.execute.mockRejectedValueOnce(error);

      const decorated = withRetry(getDeps());

      await expect(decorated.execute(mockNotification)).rejects.toThrow(error);
    });
  });

  it("should preserve other use case methods", () => {
    const complexUseCase = {
      execute: vi.fn(),
      otherMethod: vi.fn(),
    } as unknown as SendNotificationUseCase;

    const decorated = withRetry({
      sendNotificationUseCase: complexUseCase,
    });

    expect(decorated).toHaveProperty("otherMethod");
  });
});
