import { Server } from "socket.io";
import express from 'express';
import http from 'http';
import Conversation from "../models/conversation.model.js";
import UnreadMessages from "../models/unreadMessages.model.js";
import Message from "../models/message.model.js";


const app=express();
const server=http.createServer(app);

const io=new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET","POST"]
    },
});

const getRecieverSocketId=(recieverId)=>{
    return userSocketMap[recieverId]
}

const userSocketMap={};
io.on("connection",(socket)=>{
    console.log('A user connected', socket.id)
    const userId=socket.handshake.query.userId;
    if(userId!="undefined") userSocketMap[userId]=socket.id;

    //io.emit() is used to send the events to all the connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    });

    socket.on("markMessagesAsSeen",async({senderId, recieverId})=>{
        try {
            const conversation = await Conversation.findOne({
                participants: { $all: [senderId, recieverId] }
            }).populate('messages');
    
            if (!conversation) {
                throw new Error('Conversation not found');
            }
    
            const messageIdsToUpdate = conversation.messages.filter(message => 
                !message.seen 
            ).map(message => message._id);
    
            await Message.updateMany(
                { _id: { $in: messageIdsToUpdate } },
                { $set: { seen: true } }
            );

            const unreadMessages = await UnreadMessages.findOne({ userId: recieverId });

            if (unreadMessages) {
                unreadMessages.messages.delete(senderId.toString());
                await unreadMessages.save();
            } 
            io.to(userSocketMap[senderId]).emit("messagesSeen",{recieverId});


        } catch (error) {
            console.log(error);
        }
    })
});

export {app, io, server, getRecieverSocketId}