import React, { useEffect, useRef, useState } from 'react';
import Message from './Message';
import MessageSkeleton from './MessageSkeleton';
import { useSocketContext } from '../../context/SocketContext';
import notificationsound from "../../assets/sounds/notification.mp3";
import { useQuery, useQueryClient } from '@tanstack/react-query';


const Messages = ({ reciever }) => {
    const { socket } = useSocketContext();
    const [messages, setMessages]=useState([]);
    const queryClient=useQueryClient();
    const {data: authUser}=useQuery({queryKey: ["authUser"]});
    
    const {data, isLoading, refetch, isError}=useQuery({
        queryKey: ["Messages", reciever._id],
        queryFn: async()=>{
            try {
                const res = await fetch(`/api/messages/${reciever._id}`);
                const data=await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong!")
                }
                setMessages(data);
                return data;
            } catch (error) {
                throw new Error(error);
            }
        }
    });
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isLoading && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        socket?.on("newMessage",(newMessage)=>{
            newMessage.shouldShake=true;
            const sound=new Audio(notificationsound);
            sound.play();
            if (newMessage.senderId===reciever._id){
                setMessages([...messages,newMessage]);
            }
            
            // queryClient.invalidateQueries({queryKey: ["Conversations"]});
            // queryClient.invalidateQueries({queryKey: ["UnseenMessages"]});
            
        });

        return ()=>socket?.off("newMessage")
    }, [socket, messages, setMessages]);

    useEffect(()=>{
        const lastMessageFromOtherUser=messages.length && messages[messages.length-1].senderId === reciever._id;
        if(lastMessageFromOtherUser){
            socket?.emit("markMessagesAsSeen",{
                senderId: reciever._id,
                recieverId: authUser._id
            })
        }
        socket?.on("messagesSeen",({recieverId})=>{
            if(recieverId===reciever._id){
                setMessages(prev=>{
                    const updatedMessages=prev.map(message=>{
                        if(!message.seen){
                            return {
                                ...message,
                                seen: true
                            }
                        }
                        return message
                    })
                    return updatedMessages;
                })
            }
        })
    },[socket, reciever, messages, authUser])

    if (isLoading) {
        return (
            <div className="px-4 space-y-4">
                {[...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
            </div>
        );
    }

    if (isError || !messages) {
        return <div>Error loading messages</div>;
    }

    return (
        <div className="px-4 space-y-4">
            {messages.length === 0 && (
                <p className="text-center">Send a message to start the conversation</p>
            )}
            {messages.map((message) => (
                <Message key={message._id} message={message} reciever={reciever} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default Messages;
