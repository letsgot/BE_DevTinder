const express = require("express");
const profileRouter = express.Router();
const { authentication } = require('../middleware/auth')
const { User } = require("../Model/user");

profileRouter.get('/', authentication, async (req, res) => {
    let { user } = req;
    try {
        res.send(user);
    } catch (error) {
        res.status(400).send("Something went wrong");
    }
});

// find all user 
profileRouter.get('/allUsers', authentication, async (req, res) => {
    try {
        let allUsers = await User.find();  // to find all the documents associated with this collection 
        // let allUsers = await User.find({ lastName: "Chauhan" });  // filter apply on all document 
        if (!allUsers) {
            res.status(404).send("User not found");
        }
        res.status(201).json({ message: "All users found successfully", "All users": allUsers });
    } catch (error) {
        res.status(400).send("Something went wrong");
    }
})

// delete the document by _id
profileRouter.delete('/deleteUser', authentication, async (req, res) => {
    try {
        // let userId = req.body._id;
        // let deletedUser = await User.findByIdAndDelete(userId);  // delete operation by using _id
        let lastName = req.body.lastName; // delete operation by using other fields
        let deletedUser = await User.findOneAndDelete({ "lastName": lastName });
        res.send(deletedUser);
    } catch (error) {
        res.status(400).send("Something went wrong");
    }
})

// partially replace the field
profileRouter.patch('/edit', authentication, async (req, res) => {
    try {
        // validation in controller for ex -- email should not be changed once it has been signed up for this i am handling the validation using this code 
        let updatedData = req.body;
        let restrictedFields = ["email", "password"];
        for (let field in updatedData) {
            if (restrictedFields.includes(field)) {
                res.send("Email or Password should be not editable");
            }
        }
        let userId = req.user._id;
        let queryObject = await User.findOneAndUpdate({ _id: userId }, updatedData, { returnDocument: 'after', runValidators: true });
        res.status(201).json({ message: "User updated successfully", queryObject });
    } catch (error) {
        res.status(400).send("Something went wrong " + error);
    }
})

// replace the full document using put http method
profileRouter.put('/replaceData', authentication, async (req, res) => {
    try {
        let updatedData = req.body;
        let queryObject = await User.findOneAndReplace({ _id: updatedData._id }, updatedData, { returnDocument: 'after' });
        res.send(queryObject);
    } catch (error) {
        res.status(400).send("Something went wrong");
    }
})


module.exports = {
    profileRouter
}