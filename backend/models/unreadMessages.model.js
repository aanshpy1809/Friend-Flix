import mongoose, { Schema } from "mongoose";

const unreadMessageSchema = new Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messages: {
      type: Map,
      of: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      }],
      default: {}
    }
  });

const UnreadMessages = mongoose.model("UnreadMessages", unreadMessageSchema);

export default UnreadMessages;


// const { Message, UnreadMessages } = require('./path/to/your/models'); // Adjust the path as needed

// mongoose.connect('mongodb://localhost:27017/yourDatabaseName', { useNewUrlParser: true, useUnifiedTopology: true });

// async function addUnreadMessage(userId, senderId, messageId) {
//   const unreadMessages = await UnreadMessages.findOne({ userId }).exec();

//   if (unreadMessages) {
//     if (unreadMessages.messages.has(senderId.toString())) {
//       unreadMessages.messages.get(senderId.toString()).push(messageId);
//     } else {
//       unreadMessages.messages.set(senderId.toString(), [messageId]);
//     }
//     await unreadMessages.save();
//   } else {
//     const newUnreadMessages = new UnreadMessages({
//       userId,
//       messages: {
//         [senderId.toString()]: [messageId]
//       }
//     });
//     await newUnreadMessages.save();
//   }

//   console.log('Unread message added');
// }

// async function getUnreadMessages(userId) {
//   const unreadMessages = await UnreadMessages.findOne({ userId }).populate({
//     path: 'messages',
//     populate: {
//       path: 'messages',
//       model: 'Message'
//     }
//   }).exec();
//   console.log('Unread messages retrieved:', unreadMessages);
// }

// async function deleteUnreadMessagesForSender(userId, senderId) {
//   const unreadMessages = await UnreadMessages.findOne({ userId }).exec();

//   if (unreadMessages) {
//     unreadMessages.messages.delete(senderId.toString());
//     await unreadMessages.save();
//     console.log(`Unread messages from sender ${senderId} deleted for user ${userId}`);
//   } else {
//     console.log(`No unread messages found for user ${userId}`);
//   }
// }

// async function runExample() {
//   const userId = '60c72b2f9b1d8e2f88fa3b2c'; // Replace with an actual user ID
//   const senderId = '60c72b2f9b1d8e2f88fa3b2d'; // Replace with an actual sender ID
//   const messageId = '60c72b2f9b1d8e2f88fa3b2e'; // Replace with an actual message ID
  
//   await addUnreadMessage(userId, senderId, messageId);
//   await getUnreadMessages(userId);
//   await deleteUnreadMessagesForSender(userId, senderId);
//   await getUnreadMessages(userId);
//   mongoose.disconnect();
// }

// runExample();
