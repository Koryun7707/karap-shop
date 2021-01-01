require('dotenv').config();
const User = require('../models/user');
const {success, validation, err} = require('../utils/responseApi');
const {sendMessageToMail} = require('../services/mailService')

module.exports = {
    getSignUpPage: (req, res) => {
        res.render('signup', {user: req.session.user});
    },
    getLogInPage: (req, res) => {
        res.render('login', {user: req.session.user});
    },
    getUserDashboard: (req, res) => {
        req.session.user = req.user;
        res.render('index', {URL: '/', user: req.session.user});
    },
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
    userLogOut: async (req, res, next) => {
        try {
            if (req.session.user) {
                const user = await User.findById(req.session.user._id);
                user.status = false;
                await user.save();
                req.session.destroy((err) => {
                    if (err) {
                        return next(err);
                    } else {
                        return res.redirect('/');
                    }
                });
            }
        } catch (e) {
            console.log('userLogOut :' + e.stack);
        }
    },
};