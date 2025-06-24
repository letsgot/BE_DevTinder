const { Server } = require("socket.io");
const socket = require("socket.io");
const Chat = require("../Model/chat");

const socketInitialization = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // ✅ frontend origin
            credentials: true                // ✅ if you're sending cookies or auth headers
        }
    });

    io.on("connection", (socket) => {
        let roomId = null;

        socket.on('joinChat', ({ userId, targetUserId }) => {
            roomId = [userId, targetUserId].sort().join("-");
            socket.join(roomId);
            console.log(`${userId} joined room ${roomId}`);
        });

        socket.on('sendMessage', async ({ firstName, text, userId, targetUserId }) => {
            if (!roomId) return;
            try {
                // to store the chat into the db 
                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] }
                })
                if (!chat) {
                    chat = chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: []
                    });
                }
                // let chat = new Chat(chat);
                chat.messages.push({
                    senderId: userId,
                    text
                })
                await chat.save();
                io.to(roomId).emit('receiveMessage', { firstName, text });
            } catch (error) {
                console.log(error)
            }
        });
    });

}

module.exports = socketInitialization;