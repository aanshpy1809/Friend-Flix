import express from 'express';
import { followUnfollowUser, getSuggestedUser, getUserProfile, getUserProfileById, getUsers, updateUser } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router=express.Router();

router.get('/',protectRoute, getUsers);
router.get('/profile/:username',protectRoute,getUserProfile);
router.get('/id/:id',protectRoute,getUserProfileById);
router.get('/suggested',protectRoute,getSuggestedUser);
router.post('/follow/:id',protectRoute, followUnfollowUser);
router.post('/update',protectRoute, updateUser);


export default router;