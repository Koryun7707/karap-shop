const express = require('express');
const router = express.Router();
const {userLogin, userSignup ,activateHandle} = require('./controllers/user');
const {addBrand,addProduct} = require('./controllers/admin')

/**
 * User
 */

router.post('/signup', userSignup);
router.post('/login', userLogin);
router.get('/activate-account/:token',activateHandle);

/*admin*/

router.post('/add-brand',addBrand);
router.post('/add-product',addProduct);

module.exports = router;
