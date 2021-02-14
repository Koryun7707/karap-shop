require('dotenv').config();
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport(
    {

        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_AUTH_EMAIL,
            pass: process.env.MAIL_AUTH_PASS,
        },
    }
);

const sendMessageToMail = message => {
    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log(err);
        }
        //console.log("Message sent to email :", info);
    });
};

module.exports = {
    sendMessageToMail: sendMessageToMail,
};

