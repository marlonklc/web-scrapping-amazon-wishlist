const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';

const sendMail = async ({ to, subject, html }) => {
    if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured.');
    }

    const resend = new Resend(RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
        from: RESEND_FROM,
        to,
        subject,
        html
    });

    if (error) {
        throw new Error(error.message || 'Unexpected error sending email with Resend.');
    }

    return data;
}

module.exports = {
    sendMail
};