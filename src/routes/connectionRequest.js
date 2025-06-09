const express = require("express");
const { User } = require("../Model/user");
const { authentication } = require("../middleware/auth");
const { Connection } = require("../Model/connection");
const { sendEmailsInBatches } = require("../utils/emailService");

const connectionRequestRouter = express.Router();

connectionRequestRouter.post('/send/:status/:receiverId', authentication, async (req, res) => {
    try {
        const { status, receiverId } = req.params;
        const senderId = req.user._id;

        const validStatuses = ["interested", "ignored"];
        if (!validStatuses.includes(status)) {
            throw new Error("Invalid status");
        }

        if (!receiverId || !senderId) {
            throw new Error("Invalid input");
        }

        if (senderId.toString() === receiverId.toString()) {
            throw new Error("Sender and Receiver cannot be the same user.");
        }

        const existingConnection = await Connection.findOne({
            $or: [
                { receiverId, senderId },
                { receiverId: senderId, senderId: receiverId }
            ]
        });

        if (existingConnection) {
            throw new Error("Connection request already exists");
        }

        const newConnection = new Connection({
            status,
            receiverId,
            senderId
        });

        let receiverUser = await User.findById(receiverId);

        if (!receiverUser.email) {
            res.status(404).json({
                status: 404,
                message: "Receiver User not found"
            })
        }

        await newConnection.save();

        sendEmailsInBatches([receiverUser.email], "Got the new connection request", "Hello");

        res.status(200).json({
            message: `${status} saved successfully`,
            newConnection
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

connectionRequestRouter.post('/receive/:status/:requestId', authentication, async (req, res) => {
    try {
        // status - accepted or rejected 
        // only receiverId user logged in and able to change the status
        // In that connection document requestId should be valid , status of the document only be 'interested' , receiverId should be logged in user 

        const loggedIn = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ['accepted', 'rejected'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const connectionInstance = await Connection.findOne({
            status: 'interested',
            receiverId: loggedIn._id,
            _id: requestId
        });

        if (!connectionInstance) {
            return res.status(404).json({
                message: "Connection request not found"
            })
        }

        connectionInstance.status = status;
        const data = await connectionInstance.save();

        res.json({
            message: "Status updated successfully",
            data
        })
    } catch (error) {
        res.status(500).json({
            message: "Error " + error.message
        })
    }
})

module.exports = {
    connectionRequestRouter
};
