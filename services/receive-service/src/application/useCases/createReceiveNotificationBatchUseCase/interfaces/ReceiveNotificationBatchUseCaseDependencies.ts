import {
  type DispatchService,
  type EnrichmentService,
} from "../../../services/index.js";

export interface ReceiveNotificationBatchUseCaseDependencies {
  readonly enrichmentService: EnrichmentService;
  readonly dispatchService: DispatchService;
}
