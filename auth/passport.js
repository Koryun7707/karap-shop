const LocalStrategy = require('passport-local').Strategy;
const {validateUser} = require('../validations/user');
const User = require('../models/user');
const {generateAvatar} = require('../utils/helper');
const roleTypes = require('../configs/constants').ROLE_TYPES;
const {sendMessageToMail} = require('../services/mailService')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


module.exports = function (passport) {
    passport.use('signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    }, async (req, email, password, done) => {
        try {
            const {value, error} = validateUser({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword,
            });
            if (error) throw error;
            if (value.password !== value.confirmPassword) {
                if (req.session.language == 'eng') {
                    return done(null, false, {message: 'Password and confirm password fields doesn\'t match'});
                } else {
                    return done(null, false, {message: 'Գաղտնաբառերը չեն համընկնում!'});
                }
            }
            const findUser = await User.findOne({email: value.email});
            if (findUser) {
                if (req.session.language == 'eng') {
                    return done(null, false, {message: 'This email is already in use. Please use another one.'});
                } else {
                    return done(null, false, {message: 'Այս էլ-նամակն արդեն օգտագործվում է: Խնդրում եմ օգտագործել մեկ այլ մեկը!'});
                }
            }
            const userAvatar = generateAvatar(req.body.firstName, req.body.lastName);
            const userObj = {
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email,
                password: value.password,
                avatar: userAvatar
            };
            return done(null, userObj);
        } catch (e) {
            console.log(e);
            return done(e);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async function (email, password, done) {
        try {
            const user = await User.findOne({email});
            if (!user) {
                return done(null, false, {message: 'That email is not registered'});
            }
            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                return done(null, false, {message: 'Password incorrect!'});
            }
            return done(null, user);
        } catch (e) {
            return done(e);
        }
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};

