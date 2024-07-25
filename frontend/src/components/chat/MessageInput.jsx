import { BsSend } from "react-icons/bs";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CiImageOn } from "react-icons/ci";
import { IoSendSharp } from "react-icons/io5";
import { FaWindowClose } from "react-icons/fa";

const MessageInput = ({ reciever }) => {
    const [message, setMessage] = useState('');
    const [img, setImg] = useState('');
    
    const imgRef = useRef(null);

    const queryClient = useQueryClient();
    const { mutateAsync: sendMessage, isPending } = useMutation({
        mutationFn: async ({content, isImg}) => {
            const res = await fetch(`/api/messages/send/${reciever._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(isImg ? { img: content } : { message: content })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong!");
            }
            return data;
        },
        onSuccess: () => {
            
            queryClient.invalidateQueries({ queryKey: ["Messages", reciever._id] });
            console.log("success")
        }
    });

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) return;
        await sendMessage({content: message, isImg: false});
        setMessage('');
    };

    const handleSendImage = async () => {
        setImg('');
        sendMessage({content: img, isImg: true}); 
        
    };

    return (
        <div className="flex items-center">
            <div className="w-[96%]">
                <form className="px-2 my-3" onSubmit={handleSubmit}>
                    <div className="w-full relative">
                        <input
                            type="text"
                            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white"
                            placeholder="Send a message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" className="absolute inset-y-0 end-0 flex items-center pe-3">
                            {isPending ? <span className="loading loading-spinner"></span> : <BsSend />}
                        </button>
                    </div>
                </form>
            </div>
            <div className="w-[4%] flex justify-center">
                <CiImageOn
                    className="fill-primary w-10 h-10 cursor-pointer "
                    onClick={() => imgRef.current.click()}
                />
            </div>
            <input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />

            {img && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-gray-700 p-4 rounded-lg shadow-lg max-w-md w-full relative">
                        <button
                            onClick={() => {
                                setImg('');
                            }}
                            className="absolute top-2 right-2  text-white hover:text-gray-400"
                        >
                            <FaWindowClose />
                        </button>
                        <img src={img} alt="Selected" className="w-full h-auto mt-5 mb-4 max-h-[300px] object-contain" />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleSendImage}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                {isPending ? <span className="loading loading-spinner"></span>: <IoSendSharp className="mr-2" /> }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageInput;
