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
  withLoggingDecorator as withDeliveryServiceLoggingDecorator,
  withMetricsDecorator as withDeliveryServiceMetricsDecorator,
} from "../../../infrastructure/decorators/DeliveryService/index.js";
import {
  withLoggingDecorator as withSendNotificationUseCaseLoggingDecorator,
  withMetricsDecorator as withSendNotificationUseCaseMetricsDecorator,
  withRetryDecorator as withSendNotificationUseCaseRetryDecorator,
  withTracingDecorator as withSendNotificationUseCaseTracingDecorator,
} from "../../../infrastructure/decorators/SendNotificationUseCase/index.js";
import { type Container } from "../interfaces/Container.js";

export const registerApplication = (container: AwilixContainer<Container>) => {
  container.register({
    deliveryService: asFunction(
      ({ bitrixChannel, emailChannel, logger, meter }) => {
        const deliveryService = createDeliveryService({
          channels: [bitrixChannel, emailChannel],
        });
        const deliveryServiceWithLogging = withDeliveryServiceLoggingDecorator({
          deliveryService: deliveryService,
          logger,
        });
        const deliveryServiceWithMetrics = withDeliveryServiceMetricsDecorator({
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
          withSendNotificationUseCaseRetryDecorator({
            sendNotificationUseCase: sendNotificationUseCase,
          });
        const sendNotificationUseCaseWithTracing =
          withSendNotificationUseCaseTracingDecorator({
            sendNotificationUseCase: sendNotificationUseCaseWithRetry,
            tracer,
          });
        const sendNotificationUseCaseWithLogging =
          withSendNotificationUseCaseLoggingDecorator({
            sendNotificationUseCase: sendNotificationUseCaseWithTracing,
            logger,
          });
        const sendNotificationUseCaseWithMetrics =
          withSendNotificationUseCaseMetricsDecorator({
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
