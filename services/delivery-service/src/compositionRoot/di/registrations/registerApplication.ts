import { asFunction, type AwilixContainer } from "awilix";

import {
  createDeliveryService,
  createHealthService,
} from "../../../application/services/index.js";
import {
  createCheckLivenessUseCase,
  createCheckReadinessUseCase,
  createSendNotificationUseCase,
} from "../../../application/useCases/index.js";
import {
  withLogging as withDeliveryServiceLogging,
  withMetrics as withDeliveryServiceMetrics,
} from "../../../infrastructure/decorators/DeliveryService/index.js";
import {
  withLogging as withSendNotificationUseCaseLogging,
  withMetrics as withSendNotificationUseCaseMetrics,
  withRetry as withSendNotificationUseCaseRetry,
  withTracing as withSendNotificationUseCaseTracing,
} from "../../../infrastructure/decorators/SendNotificationUseCase/index.js";
import { type Container } from "../interfaces/Container.js";

export const registerApplication = (container: AwilixContainer<Container>) => {
  container.register({
    deliveryService: asFunction(
      ({ bitrixChannel, emailChannel, logger, meter }) => {
        const deliveryService = createDeliveryService({
          channels: [bitrixChannel, emailChannel],
        });
        const deliveryServiceWithLogging = withDeliveryServiceLogging({
          deliveryService: deliveryService,
          logger,
        });
        const deliveryServiceWithMetrics = withDeliveryServiceMetrics({
          deliveryService: deliveryServiceWithLogging,
          meter,
        });

        return deliveryServiceWithMetrics;
      },
    ).singleton(),

    healthService: asFunction(({ healthReporter }) => {
      return createHealthService({ healthReporter });
    }).singleton(),

    sendNotificationUseCase: asFunction(
      ({ tracer, logger, meter, deliveryService }) => {
        const sendNotificationUseCase = createSendNotificationUseCase({
          deliveryService,
        });
        const sendNotificationUseCaseWithRetry =
          withSendNotificationUseCaseRetry({
            sendNotificationUseCase: sendNotificationUseCase,
          });
        const sendNotificationUseCaseWithTracing =
          withSendNotificationUseCaseTracing({
            sendNotificationUseCase: sendNotificationUseCaseWithRetry,
            tracer,
          });
        const sendNotificationUseCaseWithLogging =
          withSendNotificationUseCaseLogging({
            sendNotificationUseCase: sendNotificationUseCaseWithTracing,
            logger,
          });
        const sendNotificationUseCaseWithMetrics =
          withSendNotificationUseCaseMetrics({
            sendNotificationUseCase: sendNotificationUseCaseWithLogging,
            meter,
          });

        return sendNotificationUseCaseWithMetrics;
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
