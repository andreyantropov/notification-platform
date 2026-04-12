import { type Broker } from "@notification-platform/amqp";
import { type Server } from "@notification-platform/http";
import {
  type Logger,
  type Meter,
  type Tracer,
} from "@notification-platform/telemetry";
import {
  type ErrorRequestHandler,
  type RequestHandler,
  type Router,
} from "express";

import {
  type HealthReporter,
  type IdGenerator,
  type Publisher,
} from "../../../application/ports/index.js";
import {
  type DispatchService,
  type EnrichmentService,
  type HealthService,
} from "../../../application/services/index.js";
import {
  type CheckLivenessUseCase,
  type CheckReadinessUseCase,
  type ReceiveNotificationBatchUseCase,
  type ReceiveNotificationUseCase,
} from "../../../application/useCases/index.js";
import { type Env } from "../../env.js";

export interface Container {
  readonly env: Env;

  readonly tracer: Tracer;
  readonly logger: Logger;
  readonly meter: Meter;

  readonly idGenerator: IdGenerator;
  readonly healthReporter: HealthReporter;
  readonly publisher: Publisher;

  readonly enrichmentService: EnrichmentService;
  readonly dispatchService: DispatchService;
  readonly healthService: HealthService;

  readonly receiveNotificationUseCase: ReceiveNotificationUseCase;
  readonly receiveNotificationBatchUseCase: ReceiveNotificationBatchUseCase;
  readonly checkLivenessUseCase: CheckLivenessUseCase;
  readonly checkReadinessUseCase: CheckReadinessUseCase;

  readonly preHandlers: (ErrorRequestHandler | RequestHandler)[];
  readonly postHandlers: (ErrorRequestHandler | RequestHandler)[];
  readonly router: Router;

  readonly broker: Broker;
  readonly server: Server;
}
