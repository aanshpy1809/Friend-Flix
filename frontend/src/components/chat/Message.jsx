import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { BsCheck2All } from "react-icons/bs";
import { FaRobot } from "react-icons/fa";


const Message = ({ message, reciever }) => {
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const fromMe = authUser._id === message.senderId;
    const chatGPT=message.chatGPT? true: false;
    const chatClassName = !fromMe || chatGPT  ? "chat-start " : "chat-end";
    const chatBackground=chatGPT? "bg-blue-500": "";
    let profilePic = fromMe ? authUser.profileImg : reciever?.profileImg;
    
    
    if (!profilePic) {
        profilePic = "https://www.gravatar.com/avatar/?d=mp";
    }
    if(chatGPT){
        profilePic="https://res.cloudinary.com/dq1cycb2e/image/upload/v1720723734/ChatGPT_logo_n7rivz.png"
    }
    return (
        <div className={`chat ${chatClassName}`}>
            <div className='chat-image avatar'>
                <div className='w-10 rounded-full'>
                    <img alt='Tailwind CSS chat bubble component' src={profilePic} />
                </div>
            </div>
            {chatGPT &&  <div className='font-bold'>ChatGPT</div>}
            <div className={`chat-bubble max-w-md text-white pb-2 relative break-words ${chatBackground}`}>
                {message.img && (
                    <img
                        src={message.img}
                        className='w-full h-auto object-contain rounded-lg border border-gray-700'
                        alt=''
                    />
                )}
                {message.message && (
                    <div className='break-words'>
                        {message.message}
                    </div>
                )}
                {fromMe && !chatGPT && (
                    <div className={`flex justify-end mt-1`}>
                        <BsCheck2All className='text-s' color={message.seen ? 'blue' : ''} />
                    </div>
                )}
                {chatGPT && (
                    <div className={`flex justify-start mt-1`}>
                        <FaRobot className='text-s' />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;
