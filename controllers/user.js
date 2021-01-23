require('dotenv').config();
const {sendMessageToMail} = require('../services/mailService')

module.exports = {
    sendMessageContactUs: async (req, res) => {
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
            await sendMessageToMail(content);
            req.flash("success_msg", 'Send Mail Completed!');
            return res.redirect("/contact");

        } catch (err) {
            console.log(err)
            req.flash("error_msg", err.message);
            return res.redirect("/contact");
        }
    },
};