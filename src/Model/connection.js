const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref : 'User'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    status: {
        type: String,
        require: true,
        enum: ['interested', 'ignored', 'accepted', 'rejected']
    }
}, { timestamps: true })

connectionSchema.index({ senderId: 1, receiverId: 1 })

connectionSchema.pre('save', function (next) {
    const currentConnectionDocument = this;
    if (currentConnectionDocument.senderId.equals(currentConnectionDocument.receiverId)) {
        throw new Error("senderId and receiverId can't be same");
    }
    next();
})

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = { Connection };