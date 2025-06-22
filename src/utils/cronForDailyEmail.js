const cron = require('node-cron');
const { Connection } = require('../Model/connection');
const { sendEmailsInBatches } = require('./emailService');

cron.schedule("* 8 * * *", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const pendingDocuments = await Connection.find({
        status: "interested",
        createdAt: {
            $gte: yesterday,
            $lt: tomorrow
        }
    })
        .populate([
            { path: 'senderId', select: 'firstName lastName email' },
            { path: 'receiverId', select: 'firstName lastName email' }
        ]);

    pendingDocuments.map(async (val) => {
        await sendEmailsInBatches([val?.receiverId?.email], `Got the new connection request from ${val?.senderId?.firstName}`, "Helllo");
    })
})

