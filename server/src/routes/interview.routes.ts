import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createInterview,
  getInterviewById,
  getUserInterviews,
  updateInterviewStatus,
  deleteInterview,
} from "../controllers/interview.controller.js";

import {
  createInterviewSchema,
  updateInterviewStatusSchema,
} from "../schemas/interview.schema.js";

const interviewRouter = Router();

interviewRouter.use(authMiddleware);

interviewRouter.post(
  "/",
  validate(createInterviewSchema),
  createInterview
);

interviewRouter.get(
  "/",
  getUserInterviews
);

interviewRouter.get(
  "/:interviewId",
  getInterviewById
);

interviewRouter.patch(
  "/:interviewId/status",
  validate(updateInterviewStatusSchema),
  updateInterviewStatus
);

interviewRouter.delete(
  "/:interviewId",
  deleteInterview
);

export default interviewRouter;