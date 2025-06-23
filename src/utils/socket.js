const { Server } = require("socket.io");
const socket = require("socket.io");

const socketInitialization = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // ✅ frontend origin
            credentials: true                // ✅ if you're sending cookies or auth headers
        }
    });

    // io.on("connection", (socket) => {
    //     console.log("New client connected:", socket.id);
    //     // user joined the chat room
    //     socket.on('joinChat', ({ userId, targetUserId }) => {
    //         console.log(userId, targetUserId, "console")
    //         const roomId = [userId, targetUserId].sort().join("-");
    //         socket.join(roomId);
    //     })

    //     socket.on('sendMessage', ({ firstName, text }) => {
    //         console.log(firstName, text, "text");
    //         const roomId = [userId, targetUserId].sort().join("-");
    //         io.to(roomId).emit('receiveMessage', {
    //             firstName, text
    //         })
    //     })
    // });
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        let roomId = null;

        socket.on('joinChat', ({ userId, targetUserId }) => {
            roomId = [userId, targetUserId].sort().join("-");
            socket.join(roomId);
            console.log(`${userId} joined room ${roomId}`);
        });

        socket.on('sendMessage', ({ firstName, text }) => {
            if (!roomId) return;
            io.to(roomId).emit('receiveMessage', { firstName, text });
        });
    });

}


module.exports = socketInitialization;