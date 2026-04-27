import { type AMQPChannel } from "@cloudamqp/amqp-client";
import {
  EVENT_TYPE,
  type Logger,
  TRIGGER_TYPE,
} from "@notification-platform/telemetry";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import { type Broker } from "../../../createBroker/index.js";

import { withLogging } from "./withLogging.js";

describe("withLogging", () => {
  let mockBroker: Mocked<Broker>;
  let mockLogger: Mocked<Logger>;
  let decorator: Broker;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    mockBroker = {
      start: vi.fn(),
      createChannel: vi.fn(),
      closeChannel: vi.fn(),
      shutdown: vi.fn(),
    } as unknown as Mocked<Broker>;

    mockLogger = {
      trace: vi.fn().mockResolvedValue(undefined),
      debug: vi.fn().mockResolvedValue(undefined),
      error: vi.fn().mockResolvedValue(undefined),
      info: vi.fn().mockResolvedValue(undefined),
      warn: vi.fn().mockResolvedValue(undefined),
      fatal: vi.fn().mockResolvedValue(undefined),
    };

    decorator = withLogging({
      broker: mockBroker,
      logger: mockLogger,
    });
  });

  describe("start", () => {
    it("should log debug and duration on successful start", async () => {
      mockBroker.start.mockImplementation(async () => {
        vi.advanceTimersByTime(100);
      });

      await decorator.start();

      expect(mockBroker.start).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Брокер успешно запущен",
          eventName: "broker.start",
          eventType: EVENT_TYPE.LIFECYCLE,
          trigger: TRIGGER_TYPE.MANUAL,
          durationMs: 100,
        }),
      );
    });

    it("should log fatal error and duration when start fails", async () => {
      const error = new Error("Connection lost");
      mockBroker.start.mockImplementation(async () => {
        vi.advanceTimersByTime(50);
        throw error;
      });

      await expect(decorator.start()).rejects.toThrow(error);

      expect(mockLogger.fatal).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Не удалось запустить брокер",
          eventName: "broker.start",
          durationMs: 50,
          error,
        }),
      );
    });
  });

  describe("createChannel", () => {
    it("should log debug and include channel id in details", async () => {
      const mockChannel = { id: "chan-123" } as unknown as AMQPChannel;
      mockBroker.createChannel.mockResolvedValue(mockChannel);

      const result = await decorator.createChannel();

      expect(result).toBe(mockChannel);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Канал успешно создан",
          eventName: "broker.create_channel",
          details: { id: "chan-123" },
        }),
      );
    });

    it("should log error if channel creation fails", async () => {
      const error = new Error("Channel limit reached");
      mockBroker.createChannel.mockRejectedValue(error);

      await expect(decorator.createChannel()).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Не удалось создать канал",
          eventName: "broker.create_channel",
          error,
        }),
      );
    });
  });

  describe("closeChannel", () => {
    it("should log debug and include channel id on closure", async () => {
      const mockChannel = { id: "chan-1" } as unknown as AMQPChannel;

      await decorator.closeChannel(mockChannel);

      expect(mockBroker.closeChannel).toHaveBeenCalledWith(mockChannel);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Канал успешно закрыт",
          eventName: "broker.close_channel",
        }),
      );
    });
  });

  describe("shutdown", () => {
    it("should log debug on broker shutdown", async () => {
      await decorator.shutdown();

      expect(mockBroker.shutdown).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Брокер успешно остановлен",
          eventName: "broker.shutdown",
        }),
      );
    });

    it("should log fatal error when shutdown fails", async () => {
      const error = new Error("Shutdown error");
      mockBroker.shutdown.mockRejectedValue(error);

      await expect(decorator.shutdown()).rejects.toThrow(error);

      expect(mockLogger.fatal).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Не удалось остановить брокер",
          eventName: "broker.shutdown",
          error,
        }),
      );
    });
  });
});
