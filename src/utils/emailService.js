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

const sendEmailsInBatches = (emails, subject, text) => {
    const BATCH_SIZE = 2;
    const DELAY = 2000;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE);

        setTimeout(() => {
            Promise.all(batch.map(email =>
                sendEmail(email, subject, text)
            ))
                .then(() => console.log(`✅ Batch ${i / BATCH_SIZE + 1} sent`))
                .catch(err => console.error(`❌ Error in batch ${i / BATCH_SIZE + 1}:`, err));
        }, (i / BATCH_SIZE) * DELAY);  
    }
};


module.exports = { sendEmailsInBatches };
