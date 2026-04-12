import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { type RouterDependencies } from "./interfaces/index.js";

export const createRouter = (dependencies: RouterDependencies): Router => {
  const {
    controllers: { healthController },
  } = dependencies;

  const healthRouter = Router();
  healthRouter.get("/live", expressAsyncHandler(healthController.live));
  healthRouter.get("/ready", expressAsyncHandler(healthController.ready));

  const rootRouter = Router();
  rootRouter.use("/health", healthRouter);

  return rootRouter;
};
