import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js"
import UnreadMessages from "../models/unreadMessages.model.js";
import { getRecieverSocketId, io } from "../socket/socket.js";
import {v2 as cloudinary} from  'cloudinary';
import openai from "../openai.js";

export const sendMessage=async(req,res)=>{
    try {
        const {message}=req.body;
        let {img}=req.body;
        const {id: receiverId}=req.params;
        const senderId=req.user._id;

        let conversation=await Conversation.findOne({
            participants: {$all: [senderId, receiverId]}
        });
        if(!conversation){
            conversation=await Conversation.create({
                participants: [senderId,receiverId]
            });
        }

        if(img){
            const uploadedResponse= await cloudinary.uploader.upload(img);
            img=uploadedResponse.secure_url;
        }

        

        const newMessage=new Message({
            senderId,
            receiverId,
            message,
            img: img || ""
        });

        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        // await conversation.save();
        // await newMessage.save();
        //this will run the above 2 commands in parallel
        await Promise.all([conversation.save(),newMessage.save()]);
        
        
        const unreadMessages = await UnreadMessages.findOne({userId:  receiverId });

        if (unreadMessages) {
            if (unreadMessages.messages.has(senderId.toString())) {
                unreadMessages.messages.get(senderId.toString()).push(newMessage._id);
            } else {
                unreadMessages.messages.set(senderId.toString(), [newMessage._id]);
            }
            await unreadMessages.save();
        } else {
            const newUnreadMessages = new UnreadMessages({
            userId: receiverId,
            messages: {
                [senderId.toString()]: [newMessage._id]
            }
            });
            await newUnreadMessages.save();
        }
        const recieverSocketId=getRecieverSocketId(receiverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage);
        }
        
        if(newMessage.message && newMessage.message.startsWith("@gpt")){
            const res=await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        "role": "system",
                        content: "You are a terse bot in a group chat responding to questions with 1-sentence answers"
                    },
                    {
                        "role": "user",
                        content: newMessage.message
                    }
                ]
            });
            const messageContent=res.choices[0].message.content;
            const chatGPTResponse=new Message({
                senderId,
                receiverId,
                message: messageContent || "I'm sorry! I don't have a response for that",
                img: "",
                chatGPT: true
            });
            if(chatGPTResponse){
                conversation.messages.push(chatGPTResponse._id);
            }
            await Promise.all([conversation.save(),chatGPTResponse.save()]);
            const senderSocketId=getRecieverSocketId(senderId);
            if(senderSocketId){
                io.to(senderSocketId).emit("newMessage",chatGPTResponse);
            }
            if(recieverSocketId){
                io.to(recieverSocketId).emit("newMessage",chatGPTResponse);
            }
        }

        if(newMessage.message && newMessage.message.startsWith("@dall-e")){
            const res=await openai.images.generate({
                model: 'dall-e-3',
                prompt: newMessage.message,
                n: 1,
                size: "1024x1024"
            });
            const imageURL=res.data[0].url;
            let image="";
            if(imageURL){
                const uploadedResponse= await cloudinary.uploader.upload(imageURL);
                image=uploadedResponse.secure_url;
            }
            const chatGPTResponse=new Message({
                senderId,
                receiverId,
                message: !imageURL ? "I'm sorry! I cannot generate this image": "",
                img: image || "",
                chatGPT: true
            });
            if(chatGPTResponse){
                conversation.messages.push(chatGPTResponse._id);
            }
            await Promise.all([conversation.save(),chatGPTResponse.save()]);
            const senderSocketId=getRecieverSocketId(senderId);
            if(senderSocketId){
                io.to(senderSocketId).emit("newMessage",chatGPTResponse);
            }
            if(recieverSocketId){
                io.to(recieverSocketId).emit("newMessage",chatGPTResponse);
            }

        }

        res.status(201).json(newMessage);
        
        

    } catch (error) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getMessages=async(req,res)=>{
    try {
        const {id: userToChatId}=req.params;
        const senderId=req.user._id;
        const conversation=await Conversation.findOne({
            participants: {$all: [senderId, userToChatId]}
        }).populate("messages"); //Not reference but actual messages
        if(!conversation){
            return res.status(201).json([]);
        }
        res.status(200).json(conversation.messages)
    } catch (error) {
        console.log("Error in getMessage controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}


export const getConversations=async(req,res)=>{
    try {
        const userId=req.user._id;
        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        })
        .populate("participants")
        .populate("messages")
        .sort({ updatedAt: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        console.log("Error in getConversations controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
     
}