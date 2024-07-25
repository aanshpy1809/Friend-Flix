import { useQuery } from '@tanstack/react-query';
import React, { useState, useRef } from 'react';
import { BsCheck2All } from "react-icons/bs";
import { FaRobot } from "react-icons/fa";

const Message = ({ message, receiver }) => {
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const [imageToDisplay, setImageToDisplay] = useState('');
    const [imgLoaded, setImgLoaded]=useState(false);
    
    const dialogRef = useRef(null);
    const fromMe = authUser._id === message.senderId;
    const chatGPT = message.chatGPT ? true : false;
    const chatClassName = !fromMe || chatGPT ? "chat-start " : "chat-end";
    const chatBackground = chatGPT ? "bg-blue-500" : "";
    let profilePic = fromMe ? authUser.profileImg : receiver?.profileImg;

    if (!profilePic) {
        profilePic = "https://www.gravatar.com/avatar/?d=mp";
    }
    if (chatGPT) {
        profilePic = "https://res.cloudinary.com/dq1cycb2e/image/upload/v1720723734/ChatGPT_logo_n7rivz.png";
    }

    const handleImageClick = (imgSrc) => {
        setImageToDisplay(imgSrc);
        dialogRef.current.showModal();
    };

    const closeModal = () => {
        dialogRef.current.close();
        setImageToDisplay('');
    };

    return (
        <>
            <div className={`chat ${chatClassName}`}>
                <div className='chat-image avatar'>
                    <div className='w-10 rounded-full'>
                        <img alt='Tailwind CSS chat bubble component' src={profilePic} />
                    </div>
                </div>
                {chatGPT && <div className='font-bold'>{message.img ? "DALL-E" : "ChatGPT"}</div>}
                <div className={`chat-bubble max-w-sm text-white pb-2 relative break-words ${chatBackground}`}>
                    {message.img && !imgLoaded && (
                        <>
                        <img
                            src={message.img}
                            className='w-full h-auto object-contain rounded-lg border border-gray-700 cursor-pointer'
                            alt=''
                            hidden
                            onLoad={()=>{setImgLoaded(true)}}
                            // onClick={() => handleImageClick(message.img)}
                        />
                        <div className="skeleton h-200 w-200"></div>
                        </>
                    )}
                    {message.img && imgLoaded && (
                        <img
                            src={message.img}
                            className='w-full h-auto object-contain rounded-lg border border-gray-700 cursor-pointer'
                            alt=''
                            onClick={() => handleImageClick(message.img)}
                        />
                    )}

                    <dialog ref={dialogRef} className="modal ">
                    <div className="relative bg-gray-700">
                        <div className="max-w-md mx-auto">
                            <button className="absolute top-2 right-2 text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center z-10" onClick={closeModal}>
                                ✕
                            </button>
                            <img src={imageToDisplay} alt="Modal content" className='object-contain w-full h-auto' />
                        </div>
                    </div>

                    </dialog>
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

            
        </>
    );
};

export default Message;
