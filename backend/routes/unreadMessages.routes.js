import express from "express";
import { protectRoute } from '../middleware/protectRoute.js';
import { deleteUnreadMessages, getUnreadMessages } from "../controllers/unreadMessages.controller.js";

const router=express.Router();
router.get("/get",protectRoute,getUnreadMessages);
router.post("/:senderId",protectRoute,deleteUnreadMessages);


export default router;