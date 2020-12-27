const express = require('express');
const router = express.Router();
const {userLogin, userSignup, activateHandle} = require('./controllers/user');
const {createProduct, deleteProduct, updateProduct} = require('./controllers/product')
const {createBrand, deleteBrand, updateBrand} = require('./controllers/brand')

/**
 * User
 */

router.post('/signup', userSignup);
router.post('/login', userLogin);
router.get('/activate-account/:token', activateHandle);

/**
 * Brand
 */

router.post('/brand', createBrand);
router.delete('/brand/:id', deleteBrand);
router.put('/brand', updateBrand);

/**
 * Product
 */

router.post('/product', createProduct);
router.delete('/product/:id', deleteProduct);
router.put('/product', updateProduct);


module.exports = router;
