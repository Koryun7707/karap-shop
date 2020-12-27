require('dotenv').config();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {success, validation, err} = require('../utils/responseApi');
const {sendMessageToMail} = require('../services/mailService');

const {logger} = require('../utils/logger');

const userSignup = async (req, res, next) => {
    passport.authenticate('signup', {}, async (error, user) => {
        try {
            if (error || !user) {
                logger.error(`User Signup Error: ${error}`);
                return res.status(500).json(err(error, res.statusCode));
            }
            req.login(user, {session: false}, async (error) => {
                if (error) {
                    return next(error);
                }
                const token = jwt.sign({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password,
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
                               <p>${CLIENT_URL}/activate-account/${token}</p>
                               <div>
                                Kind Regards,
                                Karap Manager Team
                                </div> `,
                }
                sendMessageToMail(message);
                return res.render('index', {
                    message: 'Activation link sent to email. Please activate to log in.',
                    error: null,
                    data: null
                });
                // return res.status(200).json(success('Activation link sent to email. Please activate to log in.', res.statusCode))
            });
        } catch (e) {
            logger.error(`User Signup Error: ${e}`);
            return res.status(500).json(err(e.message, res.statusCode));
        }
    })(req, res, next);
};

const activateHandle = async (req, res) => {
    logger.info('Start activate Handle - - -');
    console.log(req.params)
    try {
        const {token} = req.params;
        if (token) {
            const {email, password, firstName, lastName} = jwt.verify(token, process.env.SECRET_KEY);
            const user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                status: true,
            });
            console.log(user)
            await user.save();
            const createToken = jwt.sign({user: user._id}, process.env.SECRET_KEY, {
                expiresIn: 24 * 3600,
            },);
            return res.status(200).json(success('Account activated. You can now log in.', {
                createToken,
                user
            }, res.statusCode));
        } else {
            return res.status(422).json(validation('Account activation error!.'));
        }
    } catch (e) {
        logger.error(`User Activate Email Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));

    }
};

const userLogin = async (req, res, next) => {
    logger.info('User Start Login - - -');
    passport.authenticate('login', {}, async (error, user) => {
        try {
            if (error || !user) {
                return res.status(422).json(validation(error));
            }
            req.login(user, {session: false}, async (error) => {
                if (error) {
                    return next(error);
                }
                const token = jwt.sign({user: user._id}, process.env.SECRET_KEY, {
                    expiresIn: 24 * 3600,
                });
                return res.status(200).json(success('Success', {token, user}, res.statusCode));
            });
        } catch (e) {
            logger.error(`User login Error: ${e}`)
            return res.status(500).json(err(e.message, res.statusCode));
        }
    })(req, res, next);
};


module.exports = {
    userSignup: userSignup,
    activateHandle: activateHandle,
    userLogin: userLogin,
};