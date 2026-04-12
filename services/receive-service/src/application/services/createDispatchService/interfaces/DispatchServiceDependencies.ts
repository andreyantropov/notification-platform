import { type Publisher } from "../../../ports/index.js";

export interface DispatchServiceDependencies {
  readonly publisher: Publisher;
}
