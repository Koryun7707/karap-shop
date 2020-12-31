require('dotenv').config();
const User = require('../models/user');
const {success, validation, err} = require('../utils/responseApi');

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