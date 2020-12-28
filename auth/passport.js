const LocalStrategy = require('passport-local').Strategy;
const {validateUser} = require('../validations/user');
// Load User model
const User = require('../models/user');

module.exports = function(passport) {
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
                return done(null,false,{message:'Password and confirm password fields doesn\'t match'});
            }
            const user = await User.findOne({email: value.email});
            if (user) {
                return done(null,false,{message:'This email is already in use. Please use another one.'});
            }
            const newUser = new User( {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: email,
                password: password,
                status:true
            });
            await newUser.save();

            return done(null, newUser);
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
                return done('This email is not registered!');
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done('Incorrect password!');
            }
            return done(null, user);
        } catch (e) {
            return done(e);
        }
    }));
    // passport.use('login',new LocalStrategy({
    //     usernameField: 'email' ,
    //     passwordField: 'password',
    //
    //     }, (email, password, done) => {
    //         // Match user
    //         User.findOne({
    //             email: email
    //         }).then(user => {
    //             if (!user) {
    //                 return done(null, false, { message: 'That email is not registered' });
    //             }
    //
    //             // Match password
    //             bcrypt.compare(password, user.password, (err, isMatch) => {
    //                 if (err) throw err;
    //                 if (isMatch) {
    //                     return done(null, user);
    //                 } else {
    //                     return done(null, false, { message: 'Password incorrect' });
    //                 }
    //             });
    //         });
    //     })
    // );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};
