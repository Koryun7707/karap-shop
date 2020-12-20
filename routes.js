const express = require('express');
const router = express.Router();
const {userLogin, userSignup ,activateHandle} = require('./controllers/user');

/**
 * User
 */
router.post('/signup', userSignup);
router.post('/login', userLogin);
router.get('/activate-account/:token',activateHandle);

module.exports = router;
