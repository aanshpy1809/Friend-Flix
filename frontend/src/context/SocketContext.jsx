import {  createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";

const SocketContext=createContext();

export const useSocketContext=()=>{
    return useContext(SocketContext);
};

export const SocketContextProvider=({children})=>{
    const [socket, setSocket]=useState(null);
    const [onlineUsers,setOnlineUsers]=useState([]);
    const {data: authUser}=useQuery({queryKey: ["authUser"]});

    useEffect(()=>{
        if(authUser){
            const socket=io("https://twitter-clone-2-1lq3.onrender.com",{
                query:{
                    userId: authUser._id,
                }
            });
            setSocket(socket);
            socket.on("getOnlineUsers",(users)=>{
                setOnlineUsers(users);
            })
            return ()=>socket.close();
        }else{
            if(socket){
                socket.close();
                setSocket(null);
            }
        }
    },[authUser])

    return (
        <SocketContext.Provider value={{socket,onlineUsers}}>{children}</SocketContext.Provider>
    )
}