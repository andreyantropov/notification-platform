import { asFunction, type AwilixContainer } from "awilix";

import {
  createDispatchService,
  createEnrichmentService,
  createHealthService,
} from "../../../application/services/index.js";
import {
  createCheckLivenessUseCase,
  createCheckReadinessUseCase,
  createReceiveNotificationBatchUseCase,
  createReceiveNotificationUseCase,
} from "../../../application/useCases/index.js";
import {
  withLogging as withDispatchServiceLogging,
  withMetrics as withDispatchServiceMetrics,
} from "../../../infrastructure/decorators/DispatchService/index.js";
import {
  withLogging as withReceiveNotificationBatchLogging,
  withMetrics as withReceiveNotificationBatchMetrics,
} from "../../../infrastructure/decorators/ReceiveNotificationBatchUseCase/index.js";
import {
  withLogging as withReceiveNotificationUseCaseLogging,
  withMetrics as withReceiveNotificationUseCaseMetrics,
} from "../../../infrastructure/decorators/ReceiveNotificationUseCase/index.js";
import { type Container } from "../interfaces/Container.js";

export const registerApplication = (container: AwilixContainer<Container>) => {
  container.register({
    enrichmentService: asFunction(({ idGenerator }) => {
      return createEnrichmentService({ idGenerator });
    }).singleton(),

    dispatchService: asFunction(({ publisher, logger, meter }) => {
      const dispatchService = createDispatchService({
        publisher,
      });
      const dispatchServiceWithLogging = withDispatchServiceLogging({
        dispatchService: dispatchService,
        logger,
      });
      const dispatchServiceWithMetrics = withDispatchServiceMetrics({
        dispatchService: dispatchServiceWithLogging,
        meter,
      });

      return dispatchServiceWithMetrics;
    }).singleton(),

    healthService: asFunction(({ healthReporter }) => {
      return createHealthService({ healthReporter });
    }).singleton(),

    receiveNotificationUseCase: asFunction(
      ({ logger, meter, enrichmentService, dispatchService }) => {
        const receiveNotificationUseCase = createReceiveNotificationUseCase({
          enrichmentService,
          dispatchService,
        });
        const receiveNotificationUseCaseWithLogging =
          withReceiveNotificationUseCaseLogging({
            receiveNotificationUseCase: receiveNotificationUseCase,
            logger,
          });
        const receiveNotificationUseCaseWithMetrics =
          withReceiveNotificationUseCaseMetrics({
            receiveNotificationUseCase: receiveNotificationUseCaseWithLogging,
            meter,
          });

        return receiveNotificationUseCaseWithMetrics;
      },
    ).singleton(),

    receiveNotificationBatchUseCase: asFunction(
      ({ logger, meter, enrichmentService, dispatchService }) => {
        const receiveNotificationBatchUseCase =
          createReceiveNotificationBatchUseCase({
            enrichmentService,
            dispatchService,
          });
        const receiveNotificationBatchUseCaseWithLogging =
          withReceiveNotificationBatchLogging({
            receiveNotificationBatchUseCase: receiveNotificationBatchUseCase,
            logger,
          });
        const receiveNotificationBatchUseCaseWithMetrics =
          withReceiveNotificationBatchMetrics({
            receiveNotificationBatchUseCase:
              receiveNotificationBatchUseCaseWithLogging,
            meter,
          });

        return receiveNotificationBatchUseCaseWithMetrics;
      },
    ).singleton(),

    checkLivenessUseCase: asFunction(({ healthService }) => {
      const useCase = createCheckLivenessUseCase({
        healthService,
      });

      return useCase;
    }).singleton(),

    checkReadinessUseCase: asFunction(({ healthService }) => {
      const useCase = createCheckReadinessUseCase({
        healthService,
      });

      return useCase;
    }).singleton(),
  });
};
