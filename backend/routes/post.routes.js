import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { comment, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from '../controllers/post.controller.js';

const router=express.Router();

router.post("/create",protectRoute, createPost);
router.delete("/:id",protectRoute,deletePost);
router.post("/comment/:id",protectRoute, comment);
router.post("/like/:id",protectRoute, likeUnlikePost);
router.get("/all",protectRoute, getAllPosts);
router.get("/getLikedPosts/:id",protectRoute, getLikedPosts);
router.get("/getFollowingPosts",protectRoute, getFollowingPosts);
router.get("/getUserPosts/:username",protectRoute, getUserPosts);

export default router;