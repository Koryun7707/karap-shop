const express = require('express');
const router = express.Router();
// const {userLogin, userSignup, activateHandle} = require('./controllers/user');
const {createProduct, deleteProduct, updateProduct} = require('./controllers/product')
const {createBrand, deleteBrand, updateBrand} = require('./controllers/brand')
const passport = require('passport');
const {ensureAuthenticated} = require('./auth/auth')
/**
 * User
 */


router.post('/login',
    (req, res, next) => {
    passport.authenticate('login', {
        successRedirect: '/',
        // failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
});
router.post('/signup',
    (req, res, next) => {
    console.log(req);
    passport.authenticate('signup', {
        successRedirect: '/',
        // failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});



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
    res.render('index', {URL: '/', user:req.newUser || ''});
});


router.get('/about', (req, res) => {
    res.render('aboutUs', {URL: '/about', data: []});
});
router.get('/blog', (req, res) => {
    res.render('blog', {URL: '/blog', data: []});
});
router.get('/brand', (req, res) => {
    res.render('brand', {URL: '/brand', data: []});
});
router.get('/contact', (req, res) => {
    res.render('contactUs', {URL: '/contact', data: []});
});
router.get('/join-our-team', (req, res) => {
    res.render('joinOurTeam', {URL: '/join-our-team', data: []});
});
router.get('/shop', (req, res) => {
    res.render('shop', {URL: '/shop', data: []});
});
router.get('/admin', (req, res) => {
    res.render('admin',{data:[]});
});

module.exports = router;
