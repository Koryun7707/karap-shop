require('dotenv').config();
const {success, validation, err} = require('../utils/responseApi');
const {sendMessageToMail} = require('../services/mailService')

module.exports = {

    sendMessageContactUs: (req, res) => {
        console.log(req.body);
        try {
            const {email, firstName, message} = req.body
            console.log(req.body);
            const content = {
                from: process.env.MAIL_AUTH_EMAIL,
                to: email,
                subject: 'Message to user',
                html: `<h2>${firstName}</h2>
                       <h4>${email} </h4>
                               <div>
                                   <p>
                                    ${message}
                                    </p>
                                </div> `,
            }
            sendMessageToMail(content);
            return res.status(200).json(success('Send Mail Completed!', {}, res.statusCode))

        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
            console.log(e)
        }
    },

};