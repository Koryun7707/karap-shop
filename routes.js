const express = require('express');
const router = express.Router();
const {getLogInPage, getSignUpPage, userLogOut, getUserDashboard} = require('./controllers/user');
const {
    getAboutPage,
    getBlogPage,
    getBrandPage,
    getContactPage,
    getJoinOurTeamPage,
    getShopPage,
    getAdminAboutPage,
    getAdminAddBrandPage,
    getAdminAddProductPage,
    getAdminBrandPage,
    getAdminContactPage,
    getAdminHomePage,
    getAdminJoinOurTeamPage,
    getAdminOurBrandsPage,
    getAdminOurProductsPage,
    getAdminPage,
    getAdminShopPage
} = require('./controllers/pages');

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
router.get('/signup', forwardAuthenticated, getSignUpPage);
router.get('/login', forwardAuthenticated, getLogInPage);
router.get('/logout', userLogOut);
router.get('/', getUserDashboard);


//get page login and signup
router.get('/signup', forwardAuthenticated,(req,res)=>{
    res.render('signup',{user:req.session.user});
})
router.get('/login',forwardAuthenticated,(req,res)=>{
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

//Product
router.post('/product', createProduct);
router.delete('/product/:id', deleteProduct);
router.put('/product', updateProduct);


//Pages
router.get('/about', getAboutPage);
router.get('/blog', getBlogPage);
router.get('/brand', getBrandPage);
router.get('/contact', getContactPage);
router.get('/join-our-team', getJoinOurTeamPage);
router.get('/shop', getShopPage);


//admin dashboard
router.get('/admin', getAdminPage);
router.get('/admin-addBrand', getAdminAddBrandPage);
router.get('/admin-addProduct', getAdminAddProductPage);
router.get('/admin-home', getAdminHomePage);
router.get('/admin-shop', getAdminShopPage);
router.get('/admin-brand', getAdminBrandPage);
router.get('/admin-about', getAdminAboutPage);
router.get('/admin-contact', getAdminContactPage);
router.get('/admin-join-our-team', getAdminJoinOurTeamPage);
router.get('/admin-ourBrands', getAdminOurBrandsPage);
router.get('/admin-ourProducts', getAdminOurProductsPage);


module.exports = router;
