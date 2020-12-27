const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const {validateUser} = require('../validations/user');

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
            return done('Password and confirm password fields doesn\'t match');
        }
        const user = await User.findOne({email: value.email});
        if (user) {
            return done('This email is already in use. Please use another one.');
        }
        const userObj = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: email,
            password: password,
        };
        return done(null, userObj);
    } catch (e) {
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

// const opts = {};
// opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = process.env.SECRET_KEY;
//
// passport.use(
//     new JwtStrategy(opts, (jwt_payload, done) => {
//         User.findById(jwt_payload.user)
//             .then(user => {
//                 if (user) {
//                     return done(null, user);
//                 }
//                 return done(null, false);
//             })
//             .catch(err => console.log(err));
//     })
// );



