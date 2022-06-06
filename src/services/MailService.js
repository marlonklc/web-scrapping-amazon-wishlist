const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const sendMail = async ({ to, subject, html }) => {
    var transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    const sender = await transport.sendMail({
        from: 'marlonklc script <marlonklc@script.com>',
        to,
        subject,
        html
    })

    return sender;
}

module.exports = {
    sendMail
};