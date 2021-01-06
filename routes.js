const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const usersController = require('./controllers/user');
const pagesController = require('./controllers/pages');
const {createProduct, deleteProduct, updateProduct,getProducts} = require('./controllers/product')
const {createBrand, deleteBrand, updateBrand,getBrands} = require('./controllers/brand')
const {checkIsAuthenticated, forwardAuthenticated} = require('./auth/auth');
const {isAdmin} = require('./utils/helper');

//Multer upload image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, files, callback) {
        const ext = path.extname(files.originalname);
        const allowed = ['.png', '.jpg', '.jpeg',];
        if (allowed.includes(ext)) {
            callback(null, true);
        } else {
            callback(new Error("Only .png, .jpg, .jpeg"), false);
        }
    },
    limits: {
        fileSize: 4 * 1024 * 1024,
    },
});

//language
router.post('/change-language', pagesController.changeLanguage)

//Users
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

router.get('/signup', forwardAuthenticated, pagesController.getSignUpPage);
router.get('/login', forwardAuthenticated, pagesController.getLogInPage);
router.get('/logout', pagesController.userLogOut);
router.get('/', pagesController.getUserDashboard);

//send message contact us
router.post('/sendMessageContactUs', usersController.sendMessageContactUs);

//Brands
router.post('/brand', checkIsAuthenticated, isAdmin, upload.array('brandImages', 4), createBrand);//+
router.delete('/brand/:id', checkIsAuthenticated, isAdmin, deleteBrand);
router.put('/brand', checkIsAuthenticated, isAdmin, updateBrand);
router.get('/brands',getBrands);

//Products
router.post('/product', checkIsAuthenticated, isAdmin, upload.array('productImages', 5), createProduct);//+
router.delete('/product/:id', deleteProduct);
router.put('/product', updateProduct);
router.get('/products',getProducts);


//Pages
router.get('/about', pagesController.getAboutPage);
router.get('/blog', pagesController.getBlogPage);
router.get('/brand', pagesController.getBrandPage);
router.get('/contact', pagesController.getContactPage);
router.get('/join-our-team', pagesController.getJoinOurTeamPage);
router.get('/shop', pagesController.getShopPage);
router.get('/selectedProducts',pagesController.getSelectedProducts);
router.get('/product',pagesController.getProduct);
router.post('/shop-filter',(req,res)=>{
    console.log('shop-filter')
    console.log(1111,req.body);
    res.end();
})

//admin
router.get('/admin-home', checkIsAuthenticated, isAdmin, pagesController.getAdminHomePage);
router.post('/admin-home', checkIsAuthenticated, isAdmin, upload.array('homeSliderImages', 10), pagesController.postAdminHomePage);
router.get('/admin-shop', checkIsAuthenticated, isAdmin, pagesController.getAdminShopPage);
router.post('/admin-shop', checkIsAuthenticated, isAdmin, upload.array('shopSliderImages', 1), pagesController.postAdminShopPage);
router.get('/admin-brand', checkIsAuthenticated, isAdmin, pagesController.getAdminBrandPage);
router.post('/admin-brand', checkIsAuthenticated, isAdmin, upload.array('imagesBrandSlider', 1), pagesController.postAdminBrandPage);
router.get('/admin-about', checkIsAuthenticated, isAdmin, pagesController.getAdminAboutPage);
router.post('/admin-about', checkIsAuthenticated, isAdmin, upload.array('imagesAboutSlider', 5), pagesController.postAdminAboutPage);
router.get('/admin-contact', checkIsAuthenticated, isAdmin, pagesController.getAdminContactPage);
router.post('/admin-contact', checkIsAuthenticated, isAdmin, upload.array('imagesContactSlider', 1), pagesController.postAdminContactPage);
router.get('/admin-join-our-team', checkIsAuthenticated, isAdmin, pagesController.getAdminJoinOurTeamPage);
router.post('/admin-join-our-team', checkIsAuthenticated, isAdmin, upload.array('imagesJoinOurTeamSlider', 2), pagesController.postAdminJoinOurTeamPage);
router.get('/admin-create-brand', checkIsAuthenticated, isAdmin, pagesController.getAdminAddBrandPage);
router.get('/admin-create-product', checkIsAuthenticated, isAdmin, pagesController.getAdminAddProductPage);
router.get('/admin-all-brands', checkIsAuthenticated, isAdmin, pagesController.getAdminOurBrandsPage);
router.get('/admin-all-products', checkIsAuthenticated, isAdmin, pagesController.getAdminOurProductsPage);

module.exports = router;
