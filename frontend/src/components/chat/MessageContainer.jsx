import React, { useEffect } from 'react';
import Messages from './Messages';
import MessageInput from './MessageInput';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaArrowLeft } from 'react-icons/fa';


const MessageContainer = () => {
    const { userId } = useParams();
    const defaultProfilePic = "https://www.gravatar.com/avatar/?d=mp";

    
    
    const { data: user, isLoading } = useQuery({
        queryKey: ["ChatUser", userId],
        queryFn: async () => {
            try {
                const res = await fetch(`/api/user/id/${userId}`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong!");
                }
                return data;
            } catch (error) {
                console.error(error);
            }
        },
    });

    // useEffect(()=>{
    //     if(user){
    //         if(user._id in recievedMessages){
    //             removeMessage(user._id)
    //         }
    //     }

    // },[user]);
    

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="flex w-full flex-col h-screen">
            
            <div className="bg-slate-500 flex gap-2 items-center px-4 py-2 mb-2">
                <Link to="/chat">
                    <FaArrowLeft className="w-5 h-5" />
                </Link>
                <div className="avatar">
                    <div className="w-12 rounded-full">
                        <img
                            src={user.profileImg ? user.profileImg : defaultProfilePic}
                            alt="user avatar"
                        />
                    </div>
                </div>
                <div className="flex flex-col flex-1">
                    <div className="flex gap-3 justify-between">
                        <p className="font-bold text-gray-200">{user.fullName}</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <Messages reciever={user} />
            </div>
            <div className="px-2 py-2">
                <MessageInput reciever={user} />
            </div>
        </div>
    );
};

export default MessageContainer;
