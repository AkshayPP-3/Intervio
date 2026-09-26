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

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createInterviewSchema),
  createInterview
);

router.get(
  "/",
  getUserInterviews
);

router.get(
  "/:interviewId",
  getInterviewById
);

router.patch(
  "/:interviewId/status",
  validate(updateInterviewStatusSchema),
  updateInterviewStatus
);

router.delete(
  "/:interviewId",
  deleteInterview
);

export default router;