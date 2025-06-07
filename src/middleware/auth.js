const jwt = require("jsonwebtoken");
const { User } = require("../Model/user")
const authentication = async (req, res, next) => {
    try {
        let token = req.cookies.token;  // not able to read cookies for reading a cookies we need a middleware which cookie-parser
        if (!token) {
            throw new Error("Token required");
        }
        let decodedCookies = jwt.verify(token, "Dev@123Tinder##");
        if (!decodedCookies) {
            throw new Error("Invalid token");
        }

        let userDetails = await User.findById(decodedCookies?._id);
        if (!userDetails) {
            res.status(404).send("User not found");
        }

        req.user = userDetails;
        next();
    } catch (error) {
        res.status(400).send("Error " + error);
    }
}

module.exports = {
    authentication
}