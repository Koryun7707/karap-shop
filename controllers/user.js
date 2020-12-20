require('dotenv').config();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {success, validation, err} = require('../utils/responseApi');
const {sendMessageToMail} = require('../services/mailService');

const userSignup = async (req, res, next) => {
    passport.authenticate('signup', {}, async (error, user) => {
        try {
            if (error || !user) {
                return res.status(500).json(err(error, res.statusCode));
            }
            req.login(user, {session: false}, async (error) => {
                if (error) {
                    return next(error);
                }
                const token = jwt.sign({
                    email: user.email,
                    password: user.password,
                    status: user.status,
                }, process.env.SECRET_KEY, {
                    expiresIn: 24 * 3600,
                });
                const CLIENT_URL = 'http://' + req.headers.host;
                const message = {
                    from: process.env.MAIL_AUTH_EMAIL,
                    to: user.email,
                    subject: 'Account Verification.',
                    html: `<h4>Hello ${user.email} welcome to Karap shop! 
                                please follow via "link" link to verify your account.</h4>
                               <p>${CLIENT_URL}/api/activate/${token}</p>
                               <div>
                                Kind Regards,
                                Karap Manager Team
                                </div> `,
                }
                sendMessageToMail(message);
                return res.status(200).json(success('Activation link sent to email. Please activate to log in.', res.statusCode))
            });
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    })(req, res, next);
};

const activateHandle = async (req, res) => {
    try {
        const {token} = req.params;
        if (token) {
            const {status, email, password} = jwt.verify(token, process.env.SECRET_KEY);
            const user = new User({
                email: email,
                password: password,
                status: status,
            });
            await user.save();
            const userId = user._id;
            const createToken = jwt.sign({user: userId}, process.env.SECRET_KEY, {
                expiresIn: 24 * 3600,
            },);
            return res.status(200).json(success('Account activated. You can now log in.', {
                createToken,
                userId,
            }, res.statusCode));
        } else {
            return res.status(422).json(validation('Account activation error!.'));
        }
    } catch (e) {
        return res.status(500).json(err(e.message, res.statusCode));

    }
};

const userLogin = async (req, res, next) => {
    passport.authenticate('login', {}, async (error, user) => {
        try {
            if (error || !user) {
                return res.status(422).json(validation(error));
            }
            req.login(user, {session: false}, async (error) => {
                if (error) {
                    return next(error);
                }
                const userId = user._id;
                const token = jwt.sign({user: userId}, process.env.SECRET_KEY, {
                    expiresIn: 24 * 3600,
                });
                return res.status(200).json(success('Success', {token, userId}, res.statusCode));
            });
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    })(req, res, next);
};


module.exports = {
    userSignup: userSignup,
    activateHandle: activateHandle,
    userLogin: userLogin,
};