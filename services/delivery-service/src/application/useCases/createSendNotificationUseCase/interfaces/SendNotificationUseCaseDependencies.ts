import { type DeliveryService } from "../../../services/index.js";

export interface SendNotificationUseCaseDependencies {
  deliveryService: DeliveryService;
}
