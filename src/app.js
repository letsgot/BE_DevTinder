const express = require('express');
const app = express();
const cors = require('cors');
const { connectToDB } = require('./config/database');
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { connectionRequestRouter } = require('./routes/connectionRequest');
const { userRouter } = require('./routes/user');
require('dotenv').config();

// express.json() parses the incoming JSON payload and converts it into a JavaScript object, which is then assigned to req.body.
app.use(express.json());
app.use(cookieParser());
// Allow requests from your frontend
app.use(cors({
    origin: "http://localhost:5173", // ✅ frontend origin
    credentials: true               // ✅ if you're sending cookies or auth headers
}));

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/request', connectionRequestRouter)
app.use('/user', userRouter)

connectToDB().then(() => {
    try {
        app.listen(process.env.PORT, () => {
            console.log('server running at port 8000');
        })
    } catch (error) {
        console.log(error)
    }
})
    .catch((err) => {
        console.log("DB connection failure");
    })