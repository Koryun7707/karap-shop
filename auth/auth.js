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
        const {token} = req.params;
        jwt.verify(token, process.env.SECRET_KEY, async function (err, decodedData) {
            if (err) {
                return res.redirect('/');
            }
            const user = await User.findById(decodedData._id);
            if(user){
                return next();
            }else {
                return res.redirect('/');
            }

        })
    }
};

