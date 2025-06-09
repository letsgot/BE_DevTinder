const mongoose = require('mongoose');

let connectToDB = async function (){
    try {
       await mongoose.connect(process.env.MONGO_CONNECTION_STRING)
       console.log("db connected");
    } catch (error) {
        console.log(err)
    }
}

module.exports = {connectToDB}