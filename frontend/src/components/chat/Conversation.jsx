import React from "react";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../../context/SocketContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BsCheck2All } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";

const Conversation = ({ conversation, lastIdx, lastMessage, unseenMessages }) => {
    const defaultProfilePic = "https://www.gravatar.com/avatar/?d=mp";
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const {data: authUser}=useQuery({queryKey: ["authUser"]});
    const fromMe=lastMessage.senderId===authUser._id;
    const unseenCount = unseenMessages?.messages[conversation?._id]?.length || 0;
    const hasUnseenMessages = unseenCount > 0;

    // const { mutate: messageSeen } = useMutation({
    //     mutationFn: async () => {
    //         try {
    //             const res = await fetch(`/api/unreadMessages/${conversation._id}`, {
    //                 method: 'POST'
    //             });
    //             const data = await res.json();
    //             if (!res.ok) {
    //                 throw new Error(data.error || "Something went wrong!");
    //             }
    //             return data;
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    // });

    const handleClick = () => {
        // messageSeen();
        navigate(`/chat/${conversation._id}`);
        queryClient.invalidateQueries({ queryKey: ["UnseenMessages"] });
    }

    return (
        <div onClick={handleClick} className="relative">
            <div className={`flex gap-2 items-center ${hasUnseenMessages ? "bg-slate-700" : ""} hover:bg-sky-500 rounded p-2 py-1 cursor-pointer`}>
                <div className={`avatar ${isOnline ? 'online' : ''}`}>
                    <div className='w-12 rounded-full'>
                        <img
                            src={conversation?.profileImg ? conversation?.profileImg : defaultProfilePic}
                            alt='user avatar'
                        />
                    </div>
                </div>
                <div className='flex flex-col flex-1'>
                    <div className='flex gap-3 justify-between'>
                        <p className='font-bold text-gray-200'>{conversation?.fullName}</p>
                    </div>
                    {lastMessage && fromMe && !lastMessage.chatGPT && (
                        // <p className='text-gray-300 text-sm'>
                        //     {lastMessage.message}
                        // </p>
                        <div className="flex items-center text-gray-300 text-sm">
                            <div className="mr-2">
                                <BsCheck2All className="text-s" color={lastMessage.seen ? 'blue' : ''} />
                            </div>
                            <div className="flex-1">
                                {lastMessage.message? lastMessage.message.length>70? lastMessage.message.substring(0,70): lastMessage.message : <CiImageOn/>}
                                {lastMessage.message && lastMessage.message.length>70 && "..."}
                            </div>
                        </div>
                    )}

                    {lastMessage && (!fromMe || lastMessage.chatGPT) && (
                        // <p className='text-gray-300 text-sm'>
                        //     {lastMessage.message}
                        // </p>
                        <div>
                        <div className='text-gray-300 text-sm'>{lastMessage.message? lastMessage.message.length>70? lastMessage.message.substring(0,70): lastMessage.message : <CiImageOn/>}
                        {lastMessage.message && lastMessage.message.length>70 && "..."}
                        </div>
                        
                        {/* <div  className={`flex justify-end  mt-1 `} >
                            <BsCheck2All className='text-s'  color={lastMessage.seen? 'blue': ''}/>
                        </div> */}
                        </div>
                    )}
                </div>
                {hasUnseenMessages && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {unseenCount}
                    </div>
                )}
            </div>
            {!lastIdx ? <div className='divider my-0 py-0 h-1' /> : null}
        </div>
    );
};

export default Conversation;
