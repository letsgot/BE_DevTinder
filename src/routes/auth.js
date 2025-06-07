const express = require("express");
const { User } = require("../Model/user")
const authRouter = express.Router();
const bcrypt = require("bcryptjs");
const validator = require("validator");

// Now in this we are creating the user with dynamic way get the data from the postman or browser 
authRouter.post('/signup', async (req, res) => {

    const { firstName, lastName, email, gender, password, age, mobileNumber, photoUrl } = req.body;
    if (!firstName || !email || !password || !lastName) {
        res.status(400).send("Bad request");
    }
    try {
        // to create a hash code for password to save it in a sb 
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        // never send the req.body here directly because never trust req.body 

        const user = new User({
            firstName,
            lastName,
            email,
            gender,
            password: encryptedPassword,
            age,
            mobileNumber,
            photoUrl
        });

        // create a jwt token
        const token = await user.generateToken();

        // add the token to the cookie and send the response to the server  
        res.cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            httpOnly: true,              // Can't be accessed via JS (XSS protection)
            secure: false,               // Should be true in production (HTTPS only)
            sameSite: 'Strict'           // Prevents CSRF (use 'Lax' or 'None' as needed)
        })
        await user.save();
        res.json({
            message: "User created successfully",
            user
        })
    } catch (error) {
        res.status(400).send("Something went wrong " + error);
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const { inputValue, password } = req.body;
        // data sanitization
        if (!inputValue || !password) {
            throw new Error("Invalid credential 1");  // never which one is incorrect email/mobile or password     
        }

        let user = {};
        if (validator.isEmail(inputValue)) {
            user = await User.findOne({ email: inputValue });
        }
        else if (validator.isMobilePhone(inputValue, 'en-IN')) {
            user = await User.findOne({ mobileNumber: inputValue });
        }
        else {
            throw new Error("Invalid Credentials 2");
        }

        if (!user) {
            throw new Error("User Not Found");
        }
        const passwordVerify = await user.comparePassword(password);
        if (passwordVerify) {
            // create a jwt token
            const token = await user.generateToken();

            // add the token to the cookie and send the response to the server  
            res.cookie("token", token, {
                maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
                httpOnly: true,              // Can't be accessed via JS (XSS protection)
                secure: false,               // Should be true in production (HTTPS only)
                sameSite: 'Strict'           // Prevents CSRF (use 'Lax' or 'None' as needed)
            })

            res.json({
                message: "Login successful",
                user
            });
        }
        else {
            throw new Error("Invalid credentials");
        }
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
})

authRouter.post('/logout', (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,      // must match how it was originally set
            sameSite: 'Strict'  // must also match
        });
        res.send("Logged Out");
    } catch (error) {
        res.status(400).send("Bad Request");
    }
})


module.exports = {
    authRouter
}