import express from "express";
import {
  getFeedPosts,
  createPost,
  deletePost,
  getPostById,
  likePost,
  addComment,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.get("/:id", protectRoute, getPostById);
router.post("/:id/like", protectRoute, likePost);
router.post("/:id/comment", protectRoute, addComment);

export default router;