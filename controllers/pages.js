require('dotenv').config();

module.exports = {
    getAboutPage: (req, res) => {
        res.render('aboutUs', {URL: '/about', user: req.session.user});
    },
    getBlogPage: (req, res) => {
        res.render('blog', {URL: '/blog', user: req.session.user});
    },
    getShopPage: (req, res) => {
        res.render('shop', {URL: '/shop', user: req.session.user});
    },
    getBrandPage: (req, res) => {
        res.render('brand', {URL: '/brand', user: req.session.user});
    },
    getContactPage: (req, res) => {
        res.render('contactUs', {URL: '/contact', user: req.session.user});
    },
    getJoinOurTeamPage: (req, res) => {
        res.render('joinOurTeam', {URL: '/join-our-team', user: req.session.user});
    },//start admin pages ->
    getAdminHomePage: (req, res) => {
        res.render('admin/home', {URL: '/admin-home', user: req.session.user});
    },
    getAdminShopPage: (req, res) => {
        res.render('admin/shop', {URL: '/admin-shop', user: req.session.user});
    },
    getAdminBrandPage: (req, res) => {
        res.render('admin/brands', {URL: '/admin-brand', user: req.session.user});
    },
    getAdminBlogPage: (req, res) => {
        res.render('admin/brands', {URL: '/admin-blog', user: req.session.user});
    },
    getAdminAboutPage: (req, res) => {
        res.render('admin/aboutUs', {URL: '/admin-about', user: req.session.user});
    },
    getAdminContactPage: (req, res) => {
        res.render('admin/contactUs', {URL: '/admin-contact', user: req.session.user});
    },
    getAdminJoinOurTeamPage: (req, res) => {
        res.render('admin/joinOurTeam', {URL: '/admin-join-our-team', user: req.session.user});
    },
    getAdminAddBrandPage: (req, res) => {
        res.render('admin/addBrand', {URL: '/admin-create-brand', user: req.session.user});
    },
    getAdminAddProductPage: (req, res) => {
        res.render('admin/addProduct', {URL: 'admin-create-product', user: req.session.user});
    },
    getAdminOurBrandsPage: (req, res) => {
        res.render('admin/ourBrands', {URL: '/admin-all-brands', user: req.session.user});
    },
    getAdminOurProductsPage: (req, res) => {
        res.render('admin/ourProducts', {URL: '/admin-all-products', user: req.session.user});
    },

};