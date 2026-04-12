import { type Notification } from "@notification-platform/core";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type DeliveryService } from "../../services/index.js";
import { type MetaData } from "../../types/index.js";

import { createSendNotificationUseCase } from "./createSendNotificationUseCase.js";

describe("createSendNotificationUseCase", () => {
  let mockDeliveryService: Mocked<DeliveryService>;

  const mockNotification = {
    id: "notif-123",
  } as unknown as Notification;

  const mockMetadata: MetaData = {
    traceparent: "00-trace-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockDeliveryService = {
      deliver: vi.fn().mockResolvedValue(undefined),
    } as unknown as Mocked<DeliveryService>;
  });

  const getDeps = () => ({
    deliveryService: mockDeliveryService,
  });

  it("should call deliveryService.deliver with the notification", async () => {
    const useCase = createSendNotificationUseCase(getDeps());

    await useCase.execute(mockNotification, mockMetadata);

    expect(mockDeliveryService.deliver).toHaveBeenCalledTimes(1);
    expect(mockDeliveryService.deliver).toHaveBeenCalledWith(mockNotification);
  });

  it("should rethrow error if deliveryService fails", async () => {
    const error = new Error("Delivery failed");
    mockDeliveryService.deliver.mockRejectedValueOnce(error);

    const useCase = createSendNotificationUseCase(getDeps());

    await expect(useCase.execute(mockNotification)).rejects.toThrow(error);
  });

  it("should return an object with execute method", () => {
    const useCase = createSendNotificationUseCase(getDeps());

    expect(useCase).toHaveProperty("execute");
    expect(typeof useCase.execute).toBe("function");
  });
});
