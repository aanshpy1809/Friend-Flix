import { useQuery, useQueryClient } from '@tanstack/react-query';
import Conversation from './Conversation';
import { useEffect, useState } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import SearchBox from '../common/SearchBox';

const Conversations = () => {
    const [conversations, setConversations] = useState([]);
    const [unseenMessages, setUnseenMessages]=useState({});
    const { socket } = useSocketContext();
    const queryClient=useQueryClient();
    
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    
    const {data: UnseenMessages, refetch: refetchUnseenMessages} =useQuery({
        queryKey: ["UnseenMessages"],
        queryFn: async()=>{
            try {
                const res=await fetch("/api/unreadMessages/get");
                const data=await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong!")
                }
                setUnseenMessages(data);
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        }
    })
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["Conversations"],
        queryFn: async () => {
            try {
                const res = await fetch("/api/messages/get/conversations");
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong!");
                }
                
                setConversations(data);
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        }
    });

    useEffect(() => {
        socket?.on("newMessage", (newMessage) => {
            refetch();
            refetchUnseenMessages();
        });

        

        return () => socket?.off("newMessage");
    }, [socket]);

    

    return (
        <div className='py-2 flex flex-col overflow-auto'>
            <div className=' p-2 mb-2 flex justify-center'>
                <SearchBox parent={"chat"} />
            </div>
            {isLoading ? <span className="loading loading-spinner"></span> : null}
            {conversations?.map((conversation, idx) => (
                <Conversation
                    key={conversation._id}
                    conversation={conversation.participants[0]._id === authUser._id ? conversation.participants[1] : conversation.participants[0]}
                    lastIdx={idx === conversations.length - 1}
                    lastMessage={conversation.messages[conversation.messages.length - 1]}
                    unseenMessages={unseenMessages}
                />
            ))}
        </div>
    );
};

export default Conversations;
