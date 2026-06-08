import express from "express";
import {
  getSuggestedConnections,
  getPublicProfile,
  updateProfile,
  searchUsers,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/search", protectRoute, searchUsers);
router.put("/profile", protectRoute, updateProfile);
router.get("/:username", protectRoute, getPublicProfile);

export default router;