const mongoose = require('mongoose');

let connectToDB = async function (){
    try {
       await mongoose.connect('mongodb+srv://vivekchauhan39411:v9i6atn5QKU4Xjxw@cluster0.khvymiw.mongodb.net/devTinder?retryWrites=true&w=majority&appName=Cluster0')
       console.log("db connected");
    } catch (error) {
        console.log(err)
    }
}

module.exports = {connectToDB}