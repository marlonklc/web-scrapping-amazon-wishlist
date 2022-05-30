const nodemailer = require('nodemailer');

const sendMail = async (listName, messageHtml) => {
    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "0be06b2f54ca40",
            pass: "1af89b4c4570f3"
        }
    });

    const sender = await transport.sendMail({
        from: 'marlonklc script <marlonklc@script.com>',
        to: 'marlon.klc@gmail.com',
        subject: `wishlist sale: ${listName}`,
        html: messageHtml
    })

    console.log('mail sent with id %s', sender.messageId);
}

module.exports = {
    sendMail
};