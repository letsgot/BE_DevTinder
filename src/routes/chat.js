const express = require('express');
const Chat = require('../Model/chat');
const { authentication } = require('../middleware/auth');
const chatRouter = express.Router();

chatRouter.get('/with/:targetUserId', authentication, async (req, res) => {
    try {
        let { targetUserId } = req.params;
        let userId = req.user._id;

        if (!targetUserId) {
            return res.status(400).json({ message: "Target user ID is required" });
        }

        if (userId.toString() === targetUserId.toString()) {
            return res.status(400).json({ message: "Cannot create chat with yourself" });
        }

        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate({
            path: 'messages.senderId',
            select: 'firstName' 
        });

        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: []
            })
            await chat.save();
        }

        return res.status(200).json({ chat });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
})

module.exports = chatRouter;