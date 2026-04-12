import { type Notification } from "@notification-platform/core";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type Publisher } from "../../ports/index.js";

import { createDispatchService } from "./createDispatchService.js";
import { type DispatchServiceDependencies } from "./interfaces/index.js";

describe("createDispatchService", () => {
  let mockPublisher: Mocked<Publisher>;

  const mockNotification = {
    id: "notif-123",
    strategy: "send_to_all_available",
  } as unknown as Notification;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPublisher = {
      publish: vi.fn().mockResolvedValue(undefined),
      checkHealth: vi.fn(),
    } as unknown as Mocked<Publisher>;
  });

  const getDeps = (): DispatchServiceDependencies => ({
    publisher: mockPublisher,
  });

  it("should call publisher.publish with the correct notification", async () => {
    const service = createDispatchService(getDeps());

    await service.dispatch(mockNotification);

    expect(mockPublisher.publish).toHaveBeenCalledTimes(1);
    expect(mockPublisher.publish).toHaveBeenCalledWith(mockNotification);
  });

  it("should rethrow error if publisher.publish fails", async () => {
    const error = new Error("Publishing failed");
    mockPublisher.publish.mockRejectedValueOnce(error);

    const service = createDispatchService(getDeps());

    await expect(service.dispatch(mockNotification)).rejects.toThrow(error);
  });

  it("should return an object with dispatch method", () => {
    const service = createDispatchService(getDeps());

    expect(service).toHaveProperty("dispatch");
    expect(typeof service.dispatch).toBe("function");
  });
});
