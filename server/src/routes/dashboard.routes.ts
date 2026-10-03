import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import { getDashboardController } from "../controllers/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  authMiddleware,
  getDashboardController
);

export default dashboardRouter;