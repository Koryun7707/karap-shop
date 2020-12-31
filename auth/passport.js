const LocalStrategy = require('passport-local').Strategy;
const {validateUser} = require('../validations/user');
const User = require('../models/user');
const {generateAvatar} = require('../utils/helper');
const roleTypes = require('../configs/constants').ROLE_TYPES;

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
            const user = new User({
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email,
                password: value.password,
                roleType: roleTypes.USER,
                status: true,
                avatar: userAvatar
            });

            await user.save();
            console.log('user', user);
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
            console.log(email, password);
            const user = await User.findOne({email});
            if (!user) {
                return done(null, false, {message: 'That email is not registered'});
            }
            const isMatch = await user.comparePassword(password);
            console.log(isMatch);
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
