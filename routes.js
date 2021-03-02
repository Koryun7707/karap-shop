const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const {sendMessageContactUs, signUp, activateAccount} = require('./controllers/user');
const pagesController = require('./controllers/pages');
const {paymentPaypal, paypalSuccess, paypalCancel} = require('./services/paypal');
const {paymentStripe, stripeWebHook} = require('./services/stripe');
const {
    createProduct,
    deleteProduct,
    updateProduct,
    getProducts,
    getProductsShopFilter,
    getProductById,
    getDataSearch,
    getProductsUniqType
} = require('./controllers/product');
const {createShippingAddress, getShippingAddresses, deleteOrder} = require('./controllers/shippingAddress');
const {createBrand, deleteBrand, updateBrand, getBrands, getAllBrands} = require('./controllers/brand')
const {checkIsAuthenticated, forwardAuthenticated,checkUserIsExist} = require('./auth/auth');
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
        const allowed = ['.png', '.jpg', '.jpeg','.webp'];
        if (allowed.includes(ext)) {
            callback(null, true);
        } else {
            callback(new Error("Only .png, .jpg, .jpeg, .webp"), false);
        }
    },
    limits: {
        fileSize: 20 * 1024 * 1024,
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
            failureFlash: true,
        })(req, res, next);
    });
// router.post('/signup',
//     (req, res, next) => {
//         passport.authenticate('signup', {
//             successRedirect: '/',
//             failureRedirect: '/signup',
//             failureFlash: true
//         })(req, res, next);
//     });
router.get('/products-type',getProductsUniqType)

router.post('/signup', signUp);
router.get('/activate-account/:token', activateAccount);

router.get('/signup', forwardAuthenticated, pagesController.getSignUpPage);
router.get('/login', forwardAuthenticated, pagesController.getLogInPage);
router.get('/logout', pagesController.userLogOut);
router.get('/', pagesController.getUserDashboard);
//forgot password
router.get('/forgotPassword', pagesController.forgotPassword);
router.post('/forgotPassword', pagesController.sendEmailForgotPassword);
router.get('/resetPassword/:token', pagesController.resetPassword);
router.post('/resetPassword', pagesController.userResetPassword);
router.get('/reset-password',forwardAuthenticated,checkUserIsExist, pagesController.getresetPassword);


//send message contact us
router.post('/sendMessageContactUs', sendMessageContactUs);

//Brands
router.post('/brand', checkIsAuthenticated, isAdmin, upload.array('brandImages', 3), createBrand);//+
router.delete('/brand/:id', checkIsAuthenticated, isAdmin, deleteBrand);
router.post('/brand-edit/:_id/', checkIsAuthenticated, isAdmin, upload.array('brandImagesUpdate', 3), updateBrand);
router.get('/brands', getBrands);
router.get('/all-brands', getAllBrands)

//Products
router.post('/product', checkIsAuthenticated, isAdmin, upload.array('productImages', 5), createProduct);//+
router.delete('/product/:id/', deleteProduct);
router.post('/product-edit/:_id/', checkIsAuthenticated, isAdmin, upload.array('productImagesUpdate', 5), updateProduct);
router.get('/products', getProducts);
router.post('/product-by-id', getProductById);


//Pages
router.get('/about', pagesController.getAboutPage);
router.get('/blog', pagesController.getBlogPage);
router.get('/brand', pagesController.getBrandPage);
router.get('/contact', pagesController.getContactPage);
router.get('/join-our-team', pagesController.getJoinOurTeamPage);
router.get('/shop', pagesController.getShopPage);
router.get('/selectedProducts', pagesController.getSelectedProducts);
router.get('/product', pagesController.getProduct);
router.get('/shipping', checkIsAuthenticated, pagesController.getShipping);
router.get('/delevry', pagesController.getDelevry);
router.get('/privacyPolicy', pagesController.getPrivacyPolicy);
router.get('/termAndConditions', pagesController.getTermAndConditions);
router.post('/checkouts', checkIsAuthenticated, pagesController.getCheckouts);

//Create shipping address
router.post('/shipping-address', checkIsAuthenticated, createShippingAddress);
router.get('/shipping-address', checkIsAuthenticated, isAdmin, getShippingAddresses);
router.delete('/order/:id', checkIsAuthenticated, isAdmin, deleteOrder)

//shop Filter
router.post('/shop-filter', getProductsShopFilter);

//search
router.post('/search', getDataSearch);

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

//blog
router.get('/admin-blog', checkIsAuthenticated, isAdmin, pagesController.getAdminBlog);
router.post('/admin-blog', checkIsAuthenticated, isAdmin, upload.array('uploadImagesBlog', 2), pagesController.createAdminBlog);
router.get('/admin-all-blogs', checkIsAuthenticated, isAdmin, pagesController.getAllBlogsData);
router.delete('/blog/:id', checkIsAuthenticated, isAdmin, pagesController.deleteBlog);
router.post('/blog-edit/:_id', checkIsAuthenticated, isAdmin, upload.array('uploadImagesBlogEdit', 2), pagesController.updateBlog);

//edit
router.get('/admin-editProduct', checkIsAuthenticated, isAdmin, pagesController.editProduct);
router.get('/admin-editBrand', checkIsAuthenticated, isAdmin, pagesController.editBrand);
router.get('/admin-editBlog', checkIsAuthenticated, isAdmin, pagesController.editBlog);
router.get('/admin-sendMailShipping', checkIsAuthenticated, isAdmin, pagesController.getSendMailShipping);
router.post('/admin-sendMailShipping', checkIsAuthenticated, isAdmin, pagesController.postSendMailShipping);

//payment
router.post('/pay', checkIsAuthenticated, paymentPaypal);
router.get('/success', checkIsAuthenticated, paypalSuccess);
router.get('/cancel', checkIsAuthenticated, paypalCancel);


//Stripe payment
router.post('/purchase', checkIsAuthenticated, paymentStripe);

module.exports = router;


