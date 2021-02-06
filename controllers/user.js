require('dotenv').config();
const {sendMessageToMail} = require('../services/mailService')
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const sendMessageContactUs = async (req, res) => {
    try {
        const {email, firstName, message} = req.body
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
};

const signUp = async (req, res, next) => {
    passport.authenticate('signup', {}, async (error, user) => {
        try {
            if (error || !user) {
                req.flash('error_msg', error);
                return res.redirect('/signup');
            }
            req.login(user, {session: false}, async (error) => {
                if (error) {
                    return next(error);
                }
                const token = jwt.sign({
                    user: user
                }, process.env.SECRET_KEY, {
                    expiresIn: '5m',
                },);
                const message = {
                    from: process.env.MAIL_AUTH_EMAIL,
                    to: user.email,
                    subject: 'Welcome shop site',
                    html: `<h4>Hello ${user.email} welcome to Armat Concept shop!
                                    please follow via "link" link to verify your account.</h4>
                                   <div>
                                   <button>
                                       <a href="https://armatconcept.com/activate-account/${token}"> Activate account</a>
                                      </button>
                                    </div> `,
                }
                sendMessageToMail(message);
                req.flash('success_msg', 'Activation link sent to email. Please activate to log in.');
                return res.redirect('/signup');
            });
        } catch (e) {
            req.flash('error_msg', e.message);
            return res.redirect('/signup');
        }
    })(req, res, next);
};

const activateAccount = async (req, res) => {
    try {
        const {token} = req.params;
        if (token) {
            const {user} = jwt.verify(token, process.env.SECRET_KEY);
            let hash = bcrypt.hashSync(user.password, 10);
            let newUser = new User({
                status: true,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: hash,
                roleType: 'user',
                avatar: user.avatar
            });
            await newUser.save();
            const userObjWithoutPassword = {
                _id: newUser._id,
                status: newUser.status,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                roleType: newUser.roleType,
                avatar: newUser.avatar,
                id: newUser._id,
            }
            req.session.user = userObjWithoutPassword;
            return res.redirect('/');
        } else {
            req.flash('error_msg', 'Account activation error!');
            return res.redirect('/signup');
        }
    } catch (e) {
        req.flash('error_msg', 'Account activation error,please try again!');
        return res.redirect('/signup');
    }
};

module.exports = {
    sendMessageContactUs: sendMessageContactUs,
    signUp: signUp,
    activateAccount: activateAccount
}