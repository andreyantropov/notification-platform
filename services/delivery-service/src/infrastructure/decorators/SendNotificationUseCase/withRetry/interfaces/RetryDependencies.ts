import { type SendNotificationUseCase } from "../../../../../application/useCases/index.js";

export interface RetryDependencies {
  readonly sendNotificationUseCase: SendNotificationUseCase;
}
