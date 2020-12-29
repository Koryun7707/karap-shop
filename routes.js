const express = require('express');
const router = express.Router();
// const {userLogin, userSignup, activateHandle} = require('./controllers/user');
const {createProduct, deleteProduct, updateProduct} = require('./controllers/product')
const {createBrand, deleteBrand, updateBrand} = require('./controllers/brand')
const passport = require('passport');
const {checkIsAuthenticated, forwardAuthenticated} = require('./auth/auth')
/**
 * User
 */


router.post('/login',
    (req, res, next) => {
    passport.authenticate('login', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    });

router.post('/signup',
    (req, res, next) => {
        passport.authenticate('signup', {
            successRedirect: '/',
            failureRedirect: '/signup',
            failureFlash: true
        })(req, res, next);
    });

//get page login and signup
router.get('/signup', forwardAuthenticated,(req,res)=>{
    res.render('signup',{user:req.session.user});
})
router.get('/login',(req,res)=>{
    res.render('login',{user:req.session.user});
})



// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


router.get('/',  (req, res) => {
    req.session.user = req.user;
    res.render('index', {URL: '/', user: req.session.user});
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

router.get('/about', (req, res) => {
    res.render('aboutUs', {URL: '/about',user: req.session.user});
});
router.get('/blog', (req, res) => {
    res.render('blog', {URL: '/blog', user: req.session.user});
});
router.get('/brand', (req, res) => {
    res.render('brand', {URL: '/brand', user: req.session.user});
});
router.get('/contact', (req, res) => {
    res.render('contactUs', {URL: '/contact', user: req.session.user});
});
router.get('/join-our-team', (req, res) => {
    res.render('joinOurTeam', {URL: '/join-our-team',user: req.session.user});
});
router.get('/shop', (req, res) => {
    res.render('shop', {URL: '/shop', user: req.session.user});
});
router.get('/admin', (req, res) => {
    res.render('admin', {user: req.session.user});
});

//admin dashboard

router.get('/admin-addBrand',(req,res)=>{
    res.render('admin/addBrand',{user:req.session.user});
})
router.get('/admin-about',(req,res)=>{
    res.render('admin/aboutUs',{user:req.session.user});
})
router.get('/admin-addProduct',(req,res)=>{
    res.render('admin/addProduct',{user:req.session.user});
})
router.get('/admin-brand',(req,res)=>{
    res.render('admin/brands',{user:req.session.user});
})
router.get('/admin-contact',(req,res)=>{
    res.render('admin/contactUs',{user:req.session.user});
})
router.get('/admin-home',(req,res)=>{
    res.render('admin/home',{user:req.session.user});
})
router.get('/admin-join-our-team',(req,res)=>{
    res.render('admin/joinOurTeam',{user:req.session.user});
})
router.get('/admin-ourBrands',(req,res)=>{
    res.render('admin/ourBrands',{user:req.session.user});
})
router.get('/admin-ourProducts',(req,res)=>{
    res.render('admin/ourProducts',{user:req.session.user});
})
router.get('/admin-shop',(req,res)=>{
    res.render('admin/shop',{user:req.session.user});
})



module.exports = router;
