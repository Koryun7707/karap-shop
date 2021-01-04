require('dotenv').config();
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const {success, validation, err} = require('../utils/responseApi');
const {
    validateHomeData,
    validateShopData,
    validateBrandData,
    validateAboutData,
    validateContactData,
    validateJoinOurTeamData
} = require('../validations/pagesData');
const {moveFile} = require('../utils/helper');
const data = require('../configs/languages')
const PageData = require('../models/pagesData');
const Brand = require('../models/brands');
const Product = require('../models/product');
const User = require('../models/user')

var staticData = data[0];

const chooseLanguage = (selectLang) => {
    if (selectLang === 'eng') {
        staticData = data[0]
    } else if (selectLang === 'ru') {
        staticData = data[1]
    }
};

module.exports = {
    changeLanguage: (req, res) => {
        console.log('Start changeLanguage');
        chooseLanguage(req.body.language);
        req.session.language = req.body.language;
        res.end();
    },
    getUserDashboard: async (req, res) => {
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            req.session.user = req.user;
            const pageData = await PageData.findOne({language: req.session.language}).select('homeSliderImages homeSliderText homeProductTypeTitle').exec();
            const products = await Product.find({language: req.session.language}).select('images name').exec();
            const brands = await Brand.find({language: 'eng'}).select('images name').exec();
            res.render('index', {
                URL: '/',
                user: req.session.user,
                staticData: staticData,
                pageData: pageData,
                products: products,
                brands: brands,
            });
        } catch (e) {
            console.log(e);
        }
    },
    getAboutPage: (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        res.render('aboutUs', {
            URL: '/about',
            user: req.session.user,
            staticData: staticData,
        });
    },
    getBlogPage: async (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        console.log(req.session.language);
        const brands = await Brand.find({language: req.session.language});
        console.log(brands);
        res.render('blog', {
            URL: '/blog',
            user: req.session.user,
            staticData: staticData,
            brands: brands,
        });
    },
    getShopPage: (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        console.log(req.session.language)
        res.render('shop', {
            URL: '/shop',
            user: req.session.user,
            staticData: staticData,
        });
    },
    getBrandPage: async (req, res) => {
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            const pageData = await PageData.find({language: req.session.language}).select('imagesBrandSlider textBrandSlider');
            const brands = await Brand.find({language: req.session.language}).select('info name images');
            res.render('brand', {
                URL: '/brand',
                user: req.session.user,
                staticData: staticData,
                brands: brands,
                pageData: pageData,
            });
        } catch (e) {
            console.log(e);
        }

    },
    getContactPage: (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        res.render('contactUs', {
            URL: '/contact',
            user: req.session.user,
            staticData: staticData,
        });
    },
    getJoinOurTeamPage: (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        res.render('joinOurTeam', {
            URL: '/join-our-team',
            user: req.session.user,
            staticData: staticData,
        });
    },//start admin pages ->
    getAdminHomePage: (req, res) => {
        res.render('admin/home', {
            URL: '/admin-home',
            user: req.session.user,
            staticData: staticData,
        });
    },
    getSignUpPage: (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        res.render('signup', {
            user: req.session.user,
            staticData: staticData,
        });
    },
    getLogInPage: (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        res.render('login', {
            user: req.session.user,
            staticData: staticData,
        });
    },
    userLogOut: async (req, res, next) => {
        try {
            if (req.session.user) {
                const user = await User.findById(req.session.user._id);
                user.status = false;
                await user.save();
                req.session.destroy((err) => {
                    if (err) {
                        return next(err);
                    } else {
                        return res.redirect('/');
                    }
                });
            }
        } catch (e) {
            console.log('userLogOut :' + e.stack);
        }
    },
    postAdminHomePage: async (req, res) => {
        try {
            const files = req.files;
            const {error, value} = validateHomeData(req.body);
            if (error) {
                if (files.length > 0) {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                }
                return res.status(422).json(validation(error.message));
            }
            if (!files.length) {
                return res.status(422).json(validation('Files is required.!'));
            }
            const myPageData = await PageData.findOne({language: value.language}).exec();
            let dir = `./public/uploads/home`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) console.log(888888, err);
                });
            }
            if (!myPageData) {
                const newData = new PageData({
                    homeSliderText: value.textOnHomeSlider,
                    homeProductTypeTitle: value.homeProductTypeTitle,
                    language: value.language
                });
                newData.homeSliderImages = moveFile(files, dir);
                console.log(newData);
                newData.save((err, result) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('Brand add complete!', result, res.statusCode));
                });
            } else {
                fs.readdir(dir, (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                    }
                });
                myPageData.homeSliderText = value.textOnHomeSlider;
                myPageData.homeProductTypeTitle = value.homeProductTypeTitle;
                myPageData.language = value.language;
                myPageData.homeSliderImages = moveFile(files, dir);
                myPageData.save((err, result) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('SUCCESS', result, res.statusCode));
                });
            }
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    },//+
    getAdminShopPage: (req, res) => {
        res.render('admin/shop', {
            URL: '/admin-shop',
            user: req.session.user,
            staticData: staticData,
        });
    },
    postAdminShopPage: async (req, res) => {
        try {
            const files = req.files;
            const {error, value} = validateShopData(req.body);
            if (error) {
                if (files.length > 0) {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                }
                return res.status(422).json(validation(error.message));
            }
            if (!files.length) {
                return res.status(422).json(validation('Files is required.!'));
            }
            const myPageData = await PageData.findOne({language: value.language}).exec();
            let dir = `./public/uploads/shop`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) console.log(err);
                });
            }
            if (!myPageData) {
                const newData = new PageData({
                    textShopSlider: value.textShopSlider,
                    language: value.language
                });
                newData.imagesShopSlider = moveFile(files, dir);
                newData.save((err, result) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('Brand add complete!', result, res.statusCode));
                });
            } else {
                myPageData.textShopSlider = value.textShopSlider;
                myPageData.language = value.language;
                fs.readdir(dir, (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                    }
                });
                myPageData.imagesShopSlider = moveFile(files, dir);
                myPageData.save((err, data) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('Post shop complete!', data, res.statusCode));
                });
            }
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    },//+
    getAdminBrandPage: (req, res) => {
        res.render('admin/brands', {
            URL: '/admin-brand',
            user: req.session.user,
            staticData: staticData,
        });
    },
    postAdminBrandPage: async (req, res) => {
        try {
            const files = req.files;
            const {error, value} = validateBrandData(req.body);
            if (error && error.details) {
                if (files.length > 0) {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                }
                return res.status(422).json(validation(error.message));
            }
            if (!files.length) {
                return res.status(422).json(validation('Files is required.!'));
            }
            const myPageData = await PageData.findOne({language: value.language}).exec();
            let dir = `./public/uploads/brand-page`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) console.log(err);
                });
            }
            if (!myPageData) {
                const newData = new PageData({
                    textBrandSlider: value.textBrandSlider,
                    language: value.language
                });
                newData.imagesBrandSlider = moveFile(files, dir);
                newData.save((err, data) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('ok', data, res.statusCode));
                });
            } else {
                fs.readdir(dir, (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                    }
                });
                myPageData.textBrandSlider = value.textBrandSlider;
                myPageData.language = value.language;
                myPageData.imagesBrandSlider = moveFile(files, dir);
                myPageData.save((err, result) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('ok', result, res.statusCode));
                });
            }
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    },//+
    getAdminBlogPage: (req, res) => {
        res.render('admin/brands', {
            URL: '/admin-blog', user:
            req.session.user,
            staticData: staticData,
        });
    },
    getAdminAboutPage: (req, res) => {
        res.render('admin/aboutUs', {
            URL: '/admin-about',
            user: req.session.user,
            staticData: staticData,
        });
    },
    postAdminAboutPage: async (req, res) => {
        try {
            const files = req.files;
            const {error, value} = validateAboutData(req.body);
            if (error) {
                if (files.length > 0) {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                }
                return res.status(422).json(validation(error.message));
            }
            if (!files.length) {
                return res.status(422).json(validation('Files is required.!'));
            }
            const myPageData = await PageData.findOne({language: value.language}).exec();
            let dir = `./public/uploads/about`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) console.log(err);
                });
            }
            if (!myPageData) {
                const newData = new PageData({
                    textAboutSlider: value.textAboutSlider,
                    ourPhilosophy: value.ourPhilosophy,
                    titleOurPhilosophy: value.titleOurPhilosophy,
                    language: value.language
                });
                newData.imagesAboutSlider = moveFile(files, dir);
                newData.save(function (err, data) {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('ok', data, res.statusCode));
                });
            } else {
                myPageData.textAboutSlider = value.textAboutSlider;
                myPageData.ourPhilosophy = value.ourPhilosophy;
                myPageData.language = value.language;
                fs.readdir(dir, (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                    }
                });
                myPageData.imagesAboutSlider = moveFile(files, dir);
                myPageData.save((err, data) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('ok', data, res.statusCode));
                });
            }
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    },//+
    getAdminContactPage: (req, res) => {
        res.render('admin/contactUs', {
            URL: '/admin-contact',
            user: req.session.user,
            staticData: staticData,
        });
    },
    postAdminContactPage: async (req, res) => {
        try {
            const files = req.files;
            const {error, value} = validateContactData(req.body);
            if (error) {
                if (files.length > 0) {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                }
                return res.status(422).json(validation(error.message));
            }
            if (!files.length) {
                return res.status(422).json(validation('Files is required.!'));
            }
            const myPageData = await PageData.findOne({language: value.language}).exec();
            let dir = `./public/uploads/contact`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) console.log(err);
                });
            }
            if (!myPageData) {
                const newData = new PageData({
                    textContactSlider: value.textContactSlider,
                    imagesContactSlider: value.imagesContactSlider,
                    language: value.language
                });
                newData.imagesContactSlider = moveFile(files, dir);
                newData.save((err, result) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('ok', result, res.statusCode));
                });
            } else {
                myPageData.textContactSlider = value.textContactSlider;
                myPageData.imagesContactSlider = value.imagesContactSlider;
                myPageData.language = value.language;
                fs.readdir(dir, (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                    }
                });
                myPageData.imagesContactSlider = moveFile(files, dir);
                myPageData.save((err, data) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        throw err;
                    }
                    return res.status(200).json(success('ok', data, res.statusCode));
                });
            }
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    },//+
    getAdminJoinOurTeamPage: (req, res) => {
        res.render('admin/joinOurTeam', {
            URL: '/admin-join-our-team',
            user: req.session.user,
            staticData: staticData,
        });
    },
    postAdminJoinOurTeamPage: async (req, res) => {
        try {
            const files = req.files;
            const {error, value} = validateJoinOurTeamData(req.body);
            if (error) {
                if (files.length > 0) {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                }
                return res.status(422).json(validation(error.message));
            }
            if (!files.length || files.length !== 2) {
                files.map((file) => {
                    rimraf(`./public/uploads/${file.filename}`, (err) => {
                        if (err) console.log(err);
                    })
                });
                return res.status(422).json(validation('Files is required.!'));
            }
            const myPageData = await PageData.findOne({language: value.language}).exec();
            let dir = `./public/uploads/joinOurTeam`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) console.log(err);
                });
            }
            if (!myPageData) {
                const newData = new PageData({
                    textJoinOurTeamSlider: value.textJoinOurTeamSlider,
                    imagesJoinOurTeamSlider: value.imagesJoinOurTeamSlider,
                    joinOurTeamWorkUs: value.joinOurTeamWorkUs,
                    joinOurCol1Title: value.joinOurCol1Title,
                    joinOurCol1Text: value.joinOurCol1Text,
                    joinOurCol2Title: value.joinOurCol2Title,
                    joinOurCol2Text: value.joinOurCol2Text,
                    joinOurCol3Title: value.joinOurCol3Title,
                    joinOurCol3Text: value.joinOurCol3Text,
                    joinOurTeamPartners: value.joinOurTeamPartners,
                    joinOurTeamPartnersTitle: value.joinOurTeamPartnersTitle,
                    language: value.language,
                });
                newData.imagesJoinOurTeamSlider = moveFile(files, dir);
                newData.save((err, result) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        return res.status(422).json(validation(err.message));
                    }
                    return res.status(200).json(success('Brand add complete!', result, res.statusCode));
                });
            } else {
                myPageData.textJoinOurTeamSlider = value.textJoinOurTeamSlider;
                myPageData.joinOurTeamWorkUs = value.joinOurTeamWorkUs;
                myPageData.joinOurCol1Title = value.joinOurCol1Title;
                myPageData.joinOurCol1Text = value.joinOurCol1Text;
                myPageData.joinOurCol2Title = value.joinOurCol2Title;
                myPageData.joinOurCol2Text = value.joinOurCol2Text;
                myPageData.joinOurCol3Title = value.joinOurCol3Title;
                myPageData.joinOurCol3Text = value.joinOurCol3Text;
                myPageData.joinOurTeamPartners = value.joinOurTeamPartners;
                myPageData.joinOurTeamPartnersTitle = value.joinOurTeamPartnersTitle;
                myPageData.language = value.language;

                fs.readdir(dir, (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                    }
                });
                myPageData.imagesJoinOurTeamSlider = moveFile(files, dir);
                myPageData.save((err, result) => {
                    if (err) {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        return res.status(422).json(validation(err.message));
                    }
                    return res.status(200).json(success('Brand add complete!', result, res.statusCode));
                });
            }
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }
    },//+
    getAdminAddBrandPage: (req, res) => {
        res.render('admin/addBrand', {
            URL: '/admin-create-brand',
            user: req.session.user,
            staticData: staticData,
        });
    },
    getAdminAddProductPage: async (req, res) => {
        try {
            const brands = await Brand.find({}).select('name _id');
            res.render('admin/addProduct', {
                URL: 'admin-create-product',
                user: req.session.user,
                brands: brands,
                staticData: staticData,
            });
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }

    },
    getAdminOurBrandsPage: (req, res) => {
        res.render('admin/ourBrands', {
            URL: '/admin-all-brands',
            user: req.session.user,
            staticData: staticData,
        });
    },
    getAdminOurProductsPage: (req, res) => {
        res.render('admin/ourProducts', {
            URL: '/admin-all-products',
            user: req.session.user,
            staticData: staticData,
        });
    },
};