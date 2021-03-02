require('dotenv').config();
const User = require('../models/user')
const jwt = require('jsonwebtoken');

module.exports = {
    checkIsAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    },
    checkUserIsExist: function (req,res,next){
        const userId = JSON.parse(localStorage.getItem('userId'))
        if(userId){
            return next();
        }else {
            return res.redirect('/');
        }
    }
};


