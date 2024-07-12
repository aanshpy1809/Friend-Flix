import UnreadMessages from "../models/unreadMessages.model.js";

export const getUnreadMessages=async(req,res)=>{
    try {
        const userId=req.user._id;
        const unreadMessages = await UnreadMessages.findOne({ userId }).populate({
            path: 'messages',
            populate: {
              path: 'messages',
              model: 'Message'
            }
          });

        res.status(200).json(unreadMessages);
    } catch (error) {
        console.log("Error in getUnreadMessages controller", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const deleteUnreadMessages=async(req,res)=>{
    try {
        const userId=req.user._id;
        const {senderId}=req.params;

        const unreadMessages = await UnreadMessages.findOne({ userId });

        if (unreadMessages) {
            unreadMessages.messages.delete(senderId.toString());
            await unreadMessages.save();
        } 
        res.status(200).json({message: "deleted successfully!"});
    } catch (error) {
        console.log("Error in deleteUnreadMessages controller", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}