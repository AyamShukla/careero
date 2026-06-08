import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:userId", protectRoute, getMessages);
router.post("/:userId", protectRoute, sendMessage);

export default router;