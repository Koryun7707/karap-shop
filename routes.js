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
const {checkIsAuthenticated, forwardAuthenticated} = require('./auth/auth');
const {isAdmin} = require('./utils/helper');


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

<<<<<<< Updated upstream

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
=======
//Brand
router.post('/brand', checkIsAuthenticated, isAdmin, createBrand);
router.delete('/brand/:id', checkIsAuthenticated, isAdmin, deleteBrand);
router.put('/brand', checkIsAuthenticated, isAdmin, updateBrand);
>>>>>>> Stashed changes

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
router.get('/admin', checkIsAuthenticated, isAdmin, getAdminPage);
router.get('/admin-addBrand', checkIsAuthenticated, isAdmin, getAdminAddBrandPage);
router.get('/admin-addProduct', checkIsAuthenticated, isAdmin, getAdminAddProductPage);
router.get('/admin-home', checkIsAuthenticated, isAdmin, getAdminHomePage);
router.get('/admin-shop', checkIsAuthenticated, isAdmin, getAdminShopPage);
router.get('/admin-brand', checkIsAuthenticated, isAdmin, getAdminBrandPage);
router.get('/admin-about', checkIsAuthenticated, isAdmin, getAdminAboutPage);
router.get('/admin-contact', checkIsAuthenticated, isAdmin, getAdminContactPage);
router.get('/admin-join-our-team', checkIsAuthenticated, isAdmin, getAdminJoinOurTeamPage);
router.get('/admin-ourBrands', checkIsAuthenticated, isAdmin, getAdminOurBrandsPage);
router.get('/admin-ourProducts', checkIsAuthenticated, isAdmin, getAdminOurProductsPage);


module.exports = router;
