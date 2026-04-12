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

import { type HealthReporter } from "../../../application/ports/index.js";
import {
  type DeliveryService,
  type HealthService,
} from "../../../application/services/index.js";
import {
  type CheckLivenessUseCase,
  type CheckReadinessUseCase,
  type SendNotificationUseCase,
} from "../../../application/useCases/index.js";
import { type Channel } from "../../../domain/ports/index.js";
import { type Consumer } from "../../../infrastructure/amqp/index.js";
import { type Env } from "../../env.js";

export interface Container {
  readonly env: Env;

  readonly tracer: Tracer;
  readonly logger: Logger;
  readonly meter: Meter;

  readonly bitrixChannel: Channel;
  readonly emailChannel: Channel;

  readonly healthReporter: HealthReporter;

  readonly healthService: HealthService;
  readonly deliveryService: DeliveryService;

  readonly sendNotificationUseCase: SendNotificationUseCase;
  readonly checkLivenessUseCase: CheckLivenessUseCase;
  readonly checkReadinessUseCase: CheckReadinessUseCase;

  readonly preHandlers: (ErrorRequestHandler | RequestHandler)[];
  readonly postHandlers: (ErrorRequestHandler | RequestHandler)[];
  readonly router: Router;

  readonly broker: Broker;
  readonly consumer: Consumer;
  readonly server: Server;
}
