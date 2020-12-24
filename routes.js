const express = require('express');
const router = express.Router();
const {userLogin, userSignup ,activateHandle} = require('./controllers/user');
const {addBrand, deleteBrand, updateBrand, addProduct ,deleteProduct ,updateProduct} = require('./controllers/admin')

/**
 * User
 */

router.post('/signup', userSignup);
router.post('/login', userLogin);
router.get('/activate-account/:token',activateHandle);

/*admin*/

//brand
router.post('/brand',addBrand);
router.delete('/brand/:id',deleteBrand);
router.put('/brand',updateBrand);


//product
router.post('/product',addProduct);
router.delete('/product/:id',deleteProduct);
router.put('/product',updateProduct);


module.exports = router;
