const express = require('express');
const { authentication } = require('../middleware/auth');
const { Connection } = require('../Model/connection');
const { User } = require('../Model/user');
const userRouter = express.Router();

// total connection request
userRouter.get('/request/received', authentication, async (req, res) => {
    // user must be authenticated to access this api 
    // receivedId is equal to authenticated user id (loggedin user) 
    // status === 'interested
    const loggedInUser = req.user;

    const data = await Connection.find({
        status: 'interested',
        receiverId: loggedInUser._id
    }).populate('senderId', ["firstName", "lastName", "gender", "age", "photoUrl"])

    const filteredData = data.map((row) => ({
        sender: row.senderId,
        _id: row._id
    }));

    res.status(201).json({
        message: "Connection request found",
        data: filteredData
    })
})

// total connections of a loggedin user 
userRouter.get('/connections', authentication, async (req, res) => {
    let loggedInUser = req.user;

    console.log(loggedInUser);

    let totalConnections = await Connection.find({
        $or: [
            { senderId: loggedInUser._id, status: "accepted" },
            { receiverId: loggedInUser._id, status: "accepted" },
        ]
    })
        .populate('senderId', ["firstName", "lastName", "gender", "age", "photoUrl"])
        .populate('receiverId', ["firstName", "lastName", "gender", "age", "photoUrl"])


    totalConnections = totalConnections.map((row) => {
        return row.senderId._id.equals(loggedInUser._id) ? row?.receiverId : row?.senderId;
    })

    res.status(201).json({
        message: "Total connection fetched successfully",
        data: totalConnections
    })
})

// feed?page=1&limit=10 -- 1 to 10
// feed?page=2&limit=10 -- 11 to 20
// In Express (with Mongoose or MongoDB), `skip` and `limit` are commonly used together to implement **pagination**, which is the process of dividing a large set of data into smaller, more manageable chunks or pages. The `limit` function specifies how many documents (records) should be returned per page, while `skip` tells the database how many documents to ignore before starting to return results. For example, if you're requesting page 2 with 10 results per page, you would `skip` the first 10 (`(2 - 1) * 10`) and then `limit` the query to 10. This allows you to efficiently fetch just the data needed for a specific page without loading everything into memory. It's a standard and efficient way to handle user interfaces like “Load more” buttons or paginated tables.


userRouter.get('/feed', authentication, async (req, res) => {
    // user must be authenticated 
    // connect request to self is not possible 
    // connect request to accepted/rejected is not possible -- // connect request to interested/ignored is not possible
    // collection of connection should not have a document where loggedIn user exist in either senderId or receiverId  
    try {
        let loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        let skip = (page - 1) * limit;
        let alreadyFamiliarForFeed = await Connection.find({
            $or: [{ senderId: loggedInUser._id }, { receiverId: loggedInUser._id }]
        });

        let uniqueUserFromFamiliarUser = new Set([]);

        alreadyFamiliarForFeed.forEach((document) => {
            uniqueUserFromFamiliarUser.add(document.senderId.toString());
            uniqueUserFromFamiliarUser.add(document.receiverId.toString());
        });

        let feedUsers = await User.find({
            $and: [
                { _id: { $nin: Array.from(uniqueUserFromFamiliarUser) } },
                { _id: { $ne: loggedInUser._id } },
            ]
        })
            .select(["firstName", "lastName", "gender", "age", "photoUrl"])
            .skip(skip)
            .limit(limit);  

        res.status(200).json({
            message: "Feed fetched successfully",
            page,
            limit,
            data: feedUsers
        });
    } catch (error) {
        res.status(400).json({
            message: "Error" + error.message
        })
    }
})

module.exports = {
    userRouter
}