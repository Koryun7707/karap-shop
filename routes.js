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


router.get('/', (req, res) => {
    res.render('index', {URL: '/'});
});
router.get('/about', (req, res) => {
    res.render('aboutUs', {URL: '/about'});
});
router.get('/blog', (req, res) => {
    res.render('blog', {URL: '/blog'});
});
router.get('/brand', (req, res) => {
    res.render('brand', {URL: '/brand'});
});
router.get('/contact', (req, res) => {
    res.render('contactUs', {URL: '/contact'});
});
router.get('/join-our-team', (req, res) => {
    res.render('joinOurTeam', {URL: '/join-our-team'});
});
router.get('/shop', (req, res) => {
    res.render('shop', {URL: '/shop'});
});
router.get('/admin', (req, res) => {
    res.render('admin');
});

module.exports = router;
