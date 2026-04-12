import { type Initiator, type Notification } from "@notification-platform/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type DispatchService,
  type EnrichmentService,
} from "../../services/index.js";
import { type IncomingNotification, NOTIFY_STATUS } from "../../types/index.js";

import { createReceiveNotificationBatchUseCase } from "./createReceiveNotificationBatchUseCase.js";
import { type ReceiveNotificationBatchUseCaseDependencies } from "./interfaces/index.js";

describe("ReceiveNotificationBatchUseCase", () => {
  const mockInitiator: Initiator = { id: "user-1", name: "System" };
  const mockIncoming: IncomingNotification = {
    contacts: [],
    message: "Hello",
  };
  const mockNotification: Notification = {
    ...mockIncoming,
    strategy: "send_to_first_available",
    id: "notif-1",
    createdAt: new Date().toISOString(),
    initiator: mockInitiator,
  };

  const mockEnrichmentService = {
    enrich: vi.fn(),
  };

  const mockDispatchService = {
    dispatch: vi.fn(),
  };

  const dependencies: ReceiveNotificationBatchUseCaseDependencies = {
    enrichmentService: mockEnrichmentService as unknown as EnrichmentService,
    dispatchService: mockDispatchService as unknown as DispatchService,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("notifyBatch", () => {
    it("should return mixed results when some dispatched fail", async () => {
      const mockIncoming2: IncomingNotification = {
        ...mockIncoming,
        message: "Msg 2",
      };
      const mockNotification2: Notification = {
        ...mockNotification,
        id: "notif-2",
        message: "Msg 2",
      };

      mockEnrichmentService.enrich
        .mockReturnValueOnce(mockNotification)
        .mockReturnValueOnce(mockNotification2);

      mockDispatchService.dispatch
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Network error"));

      const useCase = createReceiveNotificationBatchUseCase(dependencies);
      const results = await useCase.execute(
        [mockIncoming, mockIncoming2],
        mockInitiator,
      );

      expect(results).toHaveLength(2);

      expect(results[0]).toEqual({
        status: NOTIFY_STATUS.SUCCESS,
        payload: mockNotification,
      });

      expect(results[1]).toEqual({
        status: NOTIFY_STATUS.SERVER_ERROR,
        error: {
          message: "Не удалось отправить уведомление",
        },
      });
    });

    it("should handle empty batch gracefully", async () => {
      const useCase = createReceiveNotificationBatchUseCase(dependencies);
      const results = await useCase.execute([], mockInitiator);

      expect(results).toEqual([]);
      expect(mockDispatchService.dispatch).not.toHaveBeenCalled();
    });
  });
});
