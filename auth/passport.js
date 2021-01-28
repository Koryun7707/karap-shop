const LocalStrategy = require('passport-local').Strategy;
const {validateUser} = require('../validations/user');
const User = require('../models/user');
const {generateAvatar} = require('../utils/helper');
const roleTypes = require('../configs/constants').ROLE_TYPES;
const {sendMessageToMail} = require('../services/mailService')
const bcrypt = require('bcrypt');


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
                return done(null, false, {message: 'Password and confirm password fields doesn\'t match'});
            }
            const findUser = await User.findOne({email: value.email});
            if (findUser) {
                return done(null, false, {message: 'This email is already in use. Please use another one.'});
            }
            const userAvatar = generateAvatar(req.body.firstName, req.body.lastName);
            let hash = bcrypt.hashSync(value.password, 10);
            const user = new User({
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email,
                password: hash,
                roleType: roleTypes.USER,
                status: true,
                avatar: userAvatar
            });

            await user.save();
            const message = {
                from: process.env.MAIL_AUTH_EMAIL,
                to: value.email,
                subject: 'Welcome Shop Site',
                html: `<h4>Hello ${value.email} welcome to Karap shop! 
                                please follow via "link" link to verify your account.</h4>
                               <div>
                               <button >
                              <a href="http://localhost:3000/">visit to eb site</a> 
                               </button>
                                </div> `,
            }
            sendMessageToMail(message);
            return done(null, user);
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
            const isMatch = bcrypt.compareSync(password,user.password);
            if (!isMatch) {
                return done(null, false, {message: 'Password incorrect'});
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
