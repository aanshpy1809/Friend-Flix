import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notifications.model.js";

import {v2 as cloudinary} from 'cloudinary';

export const createPost=async(req,res)=>{
    try {
        const {text} =req.body;
        let {img}=req.body;
        const userId=req.user._id;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found!"});
        }
        if(!img && !text){
            return res.status(400).json({error: "Either text or image is required!"});
        }
        if(img){
            const uploadResponse=await cloudinary.uploader.upload(img);
            img=uploadResponse.secure_url;
        }

        const post=new Post({
            user: userId,
            text,
            img
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.log("Error in createPost controller", error.message);
		res.status(500).json({ error: error.message});
    }
}

export const deletePost=async(req,res)=>{
    try {
        const {id: postId}=req.params;
        const userId=req.user._id;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found!"});
        }
        if(post.user.toString()!==userId.toString()){
            return res.status(401).json({error: "Not authorized to delete the Post!"});
        }

        if(post.img){
            const img=post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(img);
        }

        await Post.findByIdAndDelete(postId);

        res.status(201).json({message: "Post deleted successfully"});
    } catch (error) {
        console.log("Error in deletePost controller", error.message);
		res.status(500).json({ error: error.message});
    }
}


export const comment=async(req,res)=>{
    try {
        const {text}=req.body;
        const {id: postId}=req.params;
        const userId=req.user._id;

        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found!"});
        }
        if(!text){
            return res.status(400).json({error: "Text not present in comment!"});
        }
        const comment ={user: userId, text}
        post.comments.push(comment);
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.log("Error in comments controller", error.message);
		res.status(500).json({ error: error.message});
    }
}

export const likeUnlikePost=async(req,res)=>{
    try {
        const userId=req.user._id;
        const {id: postId}=req.params;
        const post =await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found!"});
        }
        const liked=post.likes.includes(userId);
        if(liked){
            await Post.updateOne({_id: postId}, {$pull: {likes : userId}});
            await User.updateOne({_id: userId}, {$pull: {likedPosts : postId}});
            res.status(201).json({message: "Post unliked successfully!"})
        }else{
            post.likes.push(userId);
            await User.updateOne({_id: userId}, {$push: {likedPosts : postId}});
            const notification=new Notification({
                from : userId,
                to: post.user,
                type: 'like'
            });

            await notification.save();
            await post.save();
            res.status(201).json({message: "Post liked successfully!"})
        }
    } catch (error) {
        console.log("Error in likeUnlikePost controller", error.message);
		res.status(500).json({ error: error.message});
    }
}


export const getAllPosts=async(req,res)=>{
    try {
        const posts=await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });
        if(posts.length===0){
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getAllPosts controller", error.message);
		res.status(500).json({ error: error.message});
    }
}

export const getLikedPosts=async(req,res)=>{
    try {
        const {id}=req.params;
        const user=await User.findById(id);
        if(!user) return res.status(404).json({error: "User not found!"})

        const posts=await Post.find({_id : {$in: user.likedPosts}}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(posts);

    } catch (error) {
        console.log("Error in getLikedPosts controller", error.message);
		res.status(500).json({ error: error.message});
    }
}

export const getFollowingPosts=async(req,res)=>{
    try {
        const userId=req.user._id;
        const user=await User.findById(userId);
        if(!user) return res.status(404).json({error: "User not found!"});

        const following=user.following;
        const posts=await Post.find({user: {$in: following}}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getFollowingPosts controller", error.message);
		res.status(500).json({ error: error.message});
    }
}

export const getUserPosts=async(req,res)=>{
    try {
        const {username}=req.params;
        const user=await User.findOne({username});
        if(!user) return res.status(404).json({error: "User not found!"});

        const posts=await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getFollowingPosts controller", error.message);
		res.status(500).json({ error: error.message});
    }
}