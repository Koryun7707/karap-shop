const express = require('express');
const router = express.Router();
const {userLogin, userSignup ,activateHandle} = require('./controllers/user');
const {addBrand, deleteBrand, updateBrand, addProduct} = require('./controllers/admin')

/**
 * User
 */

router.post('/signup', userSignup);
router.post('/login', userLogin);
router.get('/activate-account/:token',activateHandle);

/*admin*/

//brand
router.post('/brand',addBrand);
router.delete('/brand',deleteBrand);
router.put('/brand',updateBrand);


//product
router.post('/product',addProduct);


module.exports = router;
