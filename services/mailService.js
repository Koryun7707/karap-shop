const nodemailer = require('nodemailer')
const {MAIL_AUTH_PASS, TRANSPORT_SECURE, MAIL_PORT, MAIL_HOST, MAIL_AUTH_EMAIL} = require('../configs/constants');

const transporter = nodemailer.createTransport(
    {
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: TRANSPORT_SECURE,
        auth: {
            user: MAIL_AUTH_EMAIL,
            pass: MAIL_AUTH_PASS,
        },
    },
    {
        from: `<${MAIL_AUTH_EMAIL}>`,
    },
);

const sendMessageToMail = message => {
    transporter.sendMail(message, (err, info) => {
        if (err) {
            return true;
        }
        console.log(info);
        return false;
    });
};

module.exports = {
    sendMessageToMail: sendMessageToMail,
};
