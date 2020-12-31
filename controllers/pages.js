require('dotenv').config();
const User = require('../models/user');
const {success, validation, err} = require('../utils/responseApi');

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
    getAdminPage: (req, res) => {
        res.render('admin', {user: req.session.user});
    },
    getAdminAddBrandPage: (req, res) => {
        res.render('admin/addBrand', {user: req.session.user});
    },
    getAdminAddProductPage: (req, res) => {
        res.render('admin/addProduct', {user: req.session.user});
    },
    getAdminHomePage: (req, res) => {
        res.render('admin/home', {user: req.session.user});
    },
    getAdminShopPage: (req, res) => {
        res.render('admin/shop', {user: req.session.user});
    },
    getAdminBrandPage: (req, res) => {
        res.render('admin/brands', {user: req.session.user});
    },
    getAdminAboutPage: (req, res) => {
        res.render('shop', {URL: '/shop', user: req.session.user});
    },
    getAdminContactPage: (req, res) => {
        res.render('admin/contactUs', {user: req.session.user});
    },
    getAdminJoinOurTeamPage: (req, res) => {
        res.render('admin/joinOurTeam', {user: req.session.user});
    },
    getAdminOurBrandsPage: (req, res) => {
        res.render('admin/ourBrands', {user: req.session.user});
    },
    getAdminOurProductsPage: (req, res) => {
        res.render('admin/ourProducts', {user: req.session.user});
    },

};