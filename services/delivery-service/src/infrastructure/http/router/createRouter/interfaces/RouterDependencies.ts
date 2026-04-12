import { type HealthController } from "../../../controllers/index.js";

export interface RouterDependencies {
  readonly controllers: {
    readonly healthController: HealthController;
  };
}
