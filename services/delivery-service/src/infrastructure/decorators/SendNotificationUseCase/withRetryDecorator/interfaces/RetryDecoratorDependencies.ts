import { type SendNotificationUseCase } from "../../../../../application/useCases/index.js";

export interface RetryDecoratorDependencies {
  readonly sendNotificationUseCase: SendNotificationUseCase;
}
