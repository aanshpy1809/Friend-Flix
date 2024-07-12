import express from "express";
import { getConversations, getMessages, sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from '../middleware/protectRoute.js';

const router=express.Router();
router.get("/:id",protectRoute,getMessages);
router.get("/get/conversations",protectRoute,getConversations);
router.post("/send/:id",protectRoute,sendMessage);


export default router;