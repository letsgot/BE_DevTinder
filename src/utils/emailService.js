const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text, html = '') => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    };
    return transporter.sendMail(mailOptions);
};

const sendEmailsInBatches = (emails, subject, text, batchSize = 10, delayMs = 2000) => {
    const totalBatches = Math.ceil(emails.length / batchSize);
    let completedBatches = 0;

    return new Promise((resolve, reject) => {
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const delay = (i / batchSize) * delayMs;

            setTimeout(() => {
                Promise.all(batch.map(email => sendEmail(email, subject, text)))
                    .then(() => {
                        console.log(`✅ Batch ${i / batchSize + 1} sent`);
                    })
                    .catch((err) => {
                        console.error(`❌ Error in batch ${i / batchSize + 1}:`, err);
                    })
                    .finally(() => {
                        completedBatches++;
                        if (completedBatches === totalBatches) {
                            resolve("📬 All batches processed.");
                        }
                    });
            }, delay);
        }
    });
};


module.exports = { sendEmailsInBatches };
