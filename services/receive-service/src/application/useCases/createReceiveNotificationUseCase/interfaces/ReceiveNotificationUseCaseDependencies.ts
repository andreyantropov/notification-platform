import {
  type DispatchService,
  type EnrichmentService,
} from "../../../services/index.js";

export interface ReceiveNotificationUseCaseDependencies {
  readonly enrichmentService: EnrichmentService;
  readonly dispatchService: DispatchService;
}
