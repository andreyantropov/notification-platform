import {
  createInternalServerErrorMiddleware,
  createLoggerMiddleware,
  createMeterMiddleware,
  createNotFoundMiddleware,
  createTimeoutErrorMiddleware,
} from "@notification-platform/http";
import { asFunction, type AwilixContainer } from "awilix";
import express from "express";

import {
  createHealthController,
  createRouter,
} from "../../../infrastructure/http/index.js";
import { type Container } from "../interfaces/Container.js";

export const registerHandlers = (container: AwilixContainer<Container>) => {
  container.register({
    preHandlers: asFunction(({ logger, meter }) => {
      const loggerMiddleware = createLoggerMiddleware({ logger });
      const meterMiddleware = createMeterMiddleware({ meter });

      return [express.json(), loggerMiddleware, meterMiddleware];
    }).singleton(),

    postHandlers: asFunction(() => {
      const notFoundMiddleware = createNotFoundMiddleware();
      const timeoutErrorMiddleware = createTimeoutErrorMiddleware();
      const internalServerErrorMiddleware =
        createInternalServerErrorMiddleware();

      return [
        notFoundMiddleware,
        timeoutErrorMiddleware,
        internalServerErrorMiddleware,
      ];
    }).singleton(),

    router: asFunction(({ checkLivenessUseCase, checkReadinessUseCase }) => {
      const healthController = createHealthController({
        checkLivenessUseCase,
        checkReadinessUseCase,
      });

      const appRouter = createRouter({
        controllers: {
          healthController,
        },
      });

      return appRouter;
    }).singleton(),
  });
};
