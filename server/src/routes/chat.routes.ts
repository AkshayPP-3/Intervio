import { Router } from "express";
import {
  createChatController,
  getUserChatsController,
  getChatByIdController,
  createMessageController,
  getChatMessagesController,
} from "../controllers/chat.controller.js";
import { aiRateLimiter } from "../middleware/rateLimit.niddleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const chatRouter = Router();

chatRouter.post(
  "/",
  authMiddleware,
  createChatController
);

chatRouter.get(
  "/",
  authMiddleware,
  getUserChatsController
);

chatRouter.get(
  "/:chatId",
  authMiddleware,
  getChatByIdController
);

chatRouter.post(
  "/:chatId/messages",
  aiRateLimiter,
  authMiddleware,
  createMessageController
);

chatRouter.get(
  "/:chatId/messages",
  authMiddleware,
  getChatMessagesController
);

export default chatRouter;