require('dotenv').config();
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const {err} = require('../utils/responseApi');
const {
    validateHomeData,
    validateShopData,
    validateBrandData,
    validateAboutData,
    validateContactData,
    validateJoinOurTeamData
} = require('../validations/pagesData');
const {moveFile, getStaticData} = require('../utils/helper');
const PageData = require('../models/pagesData');
const Brand = require('../models/brands');
const Product = require('../models/product');
const User = require('../models/user')
const {logger} = require('../utils/logger')
const jwt = require('jsonwebtoken');
const {sendMessageToMail} = require('../services/mailService');
const bcrypt = require('bcrypt');
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./userStorage');

module.exports = {
    changeLanguage: async (req, res) => {
        console.log('Start changeLanguage');
        req.session.language = req.body.language;
        res.end();
    },
    getUserDashboard: async (req, res, next) => {
        logger.info(`Start getUserDashboard Page Data - - -`);
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            req.session.user = req.user;
            let pageData = await PageData.find({language: req.session.language}).select('homeSliderImages homeSliderText homeProductTypeTitle').exec();
            if (req.session.language !== 'eng' && pageData.length) {
                const arrayImages = await PageData.findOne({language: 'eng'}).select('homeSliderImages').exec();
                pageData[0].homeSliderImages = arrayImages.homeSliderImages;
            }
            let products = await Product.find({language: req.session.language}).select('images name type').exec();

            products = [...new Map(products.map(item =>
                [item['type'], item])).values()];
            const countOfBrands = await Brand.find({language: req.session.language}).exec();
            res.render('index', {
                URL: '/',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
                pageData: pageData,
                products: products,
                pages: countOfBrands.length
            });
        } catch (e) {
            logger.error(`Start Home Page Data Error:${e}`)
            req.flash('error_msg', e.message);
            res.redirect('/');
        }
    },//done
    getAboutPage: async (req, res) => {
        logger.info('Start About Page Data Get - - -');
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            let pageData = await PageData.find({language: req.session.language}).select('imagesAboutSlider textAboutSlider ourPhilosophy textOnAboutSlider titleOurPhilosophy').exec();
            if (req.session.language !== 'eng' && pageData.length) {
                const arrayImages = await PageData.findOne({language: 'eng'}).select('imagesAboutSlider').exec();
                pageData[0].imagesAboutSlider = arrayImages.imagesAboutSlider;
            }
            res.render('aboutUs', {
                URL: '/about',
                user: req.session.user,
                pageData: pageData,
                staticData: await getStaticData(req.session.language),
            });
        } catch (e) {
            logger.error(`Get About Page Data Error:${e}`)
            req.flash('error_msg', e.message);
            res.redirect('/')
        }

    },
    getBlogPage: async (req, res) => {
        logger.info(`Start Blog Page Data Get - - -`);
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            const brands = await Brand.find({language: req.session.language}).exec();
            res.render('blog', {
                URL: '/blog',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
                brands: brands,
            });
        } catch (e) {
            logger.error(`Get Blog Page Data Error:${e}`);
            req.flash('error_msg', e.message);
            res.redirect('/');
        }

    },//done
    getShopPage: async (req, res) => {
        logger.info('Start Shop get - - -');
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            const pageData = await PageData.find({language: req.session.language}).select('textShopSlider imagesShopSlider -_id').exec();
            if (req.session.language !== 'eng' && pageData.length) {
                const arrayImages = await PageData.findOne({language: 'eng'}).select('imagesShopSlider').exec();
                pageData[0].imagesShopSlider = arrayImages.imagesShopSlider;
            }
            const productsType = await Product.find({language: req.session.language}).distinct('type').exec();
            const brands = await Brand.find({language: req.session.language}).select('name').exec();
            let maxPrice = await Product.find({language: req.session.language}).select('-_id price');
            maxPrice = Math.max.apply(Math, maxPrice.map(function (o) {
                return o.price;
            }))
            const type = req.query.type || null;
            const brandName = req.query.brandName || null;
            res.render('shop', {
                URL: '/shop',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
                pageData: pageData,
                productsType: productsType,
                brands: brands,
                type: type,
                brandName: brandName,
                maxPrice: maxPrice,
            });
        } catch (e) {
            console.log(`Get Brands Error: ${e}`)
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    getSelectedProducts: async (req, res) => {
        logger.info(`Start SelectedProduct Page Data Get - - -`);
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            res.render('selectedProducts', {
                URL: '/selectedProducts',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
            });
        } catch (e) {
            logger.error(`SelectedProduct Page Data Error:${e.message}`);
            req.flash('error_msg', e.message);
            return res.redirect('/');
        }

    },
    getProduct: async (req, res) => {
        logger.info('Start get Product - - -');
        try {
            const {_id} = req.query;
            const product = await Product.find({_id}).lean().exec();
            res.render('product', {
                URL: '/product',
                user: req.session.user,
                product: product,
                staticData: await getStaticData(req.session.language),
            });
        } catch (e) {
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    getBrandPage: async (req, res) => {
        logger.info(`Start Get Brand Page Data - - -`);
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            req.session.user = req.user;
            let pageData = await PageData.find({language: req.session.language}).select('imagesBrandSlider textBrandSlider').exec();
            if (req.session.language !== 'eng' && pageData.length) {
                const arrayImages = await PageData.findOne({language: 'eng'}).select('imagesBrandSlider').exec();
                pageData[0].imagesBrandSlider = arrayImages.imagesBrandSlider;
            }
            const brands = await Brand.find({language: req.session.language}).select('info name images');
            res.render('brand', {
                URL: '/brand',
                user: req.session.user,
                pageData: pageData,
                staticData: await getStaticData(req.session.language),
                brands: brands,
                pages: brands.length
            });
        } catch (e) {
            logger.error(`Brand Page Data Get Error:${e}`)
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },//done
    getContactPage: async (req, res) => {
        logger.info('Start Get Contact Page Data - - -');
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            let pageData = await PageData.find({language: req.session.language}).select('imagesContactSlider textContactSlider').exec();
            if (req.session.language !== 'eng' && pageData.length) {
                const arrayImages = await PageData.findOne({language: 'eng'}).select('imagesContactSlider').exec();
                pageData[0].imagesContactSlider = arrayImages.imagesContactSlider;
            }
            res.render('contactUs', {
                URL: '/contact',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
                pageData: pageData,
            });
        } catch (e) {
            logger.error(`Get Contact Page Data Error:${e}`);
            req.flash('error_msg', e.message);
            res.redirect('/');
        }

    },
    getJoinOurTeamPage: async (req, res) => {
        logger.info('Start Get Page Data Join Our Team - - -');
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            const pageData = await PageData.find({language: req.session.language}).select('imagesJoinOurTeamSlider textJoinOurTeamSlider joinOurCol1Text joinOurCol2Text joinOurCol3Text joinOurCol1Title joinOurCol2Title joinOurCol3Title joinOurTeamPartnersTitle  joinOurTeamWorkUs joinOurTeamPartners');
            if (req.session.language !== 'eng' && pageData.length) {
                const arrayImages = await PageData.findOne({language: 'eng'}).select('imagesJoinOurTeamSlider').exec();
                pageData[0].imagesJoinOurTeamSlider = arrayImages.imagesJoinOurTeamSlider;
            }
            res.render('joinOurTeam', {
                URL: '/join-our-team',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
                pageData: pageData,
            });
        } catch (e) {
            logger.error(`Start Get Data JoinOurTeam Data Error:${e}`)
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    //start admin pages ->
    getAdminHomePage: async (req, res) => {
        res.render('admin/home', {
            URL: '/admin-home',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
        });
    },//done
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
                req.flash('error_msg', error.message);
                return res.redirect('/admin-home');
            }
            if (!files.length && value.language === 'eng') {
                req.flash('error_msg', "Files is required.!");
                return res.redirect('/admin-home');
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
                if (value.language === 'eng') {
                    newData.homeSliderImages = moveFile(files, dir);
                } else {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                    newData.homeSliderImages = [];
                }
                newData.save((err, result) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('success_msg', "Home Page Data Add Completed!");
                        return res.redirect('/admin-home');
                    }
                    req.flash('success_msg', "Home Page Data Add Completed!");
                    return res.redirect('/admin-home');
                });
            } else {
                if (files.length && value.language === 'eng') {
                    fs.readdir(dir, (error, files) => {
                        if (error) throw error;
                        for (const file of files) {
                            fs.unlink(path.join(dir, file), err => {
                                if (err) throw err;
                            });
                        }
                    });
                } else {
                    files.forEach((file) => {
                        fs.unlink(file.path, err => {
                            if (err) throw err;
                        });
                    })
                }
                myPageData.homeSliderText = value.textOnHomeSlider;
                myPageData.homeProductTypeTitle = value.homeProductTypeTitle;
                myPageData.language = value.language;
                if (value.language === 'eng') {
                    myPageData.homeSliderImages = moveFile(files, dir);
                } else {
                    myPageData.homeSliderImages = [];
                }
                myPageData.save((err, result) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-home');
                    }
                    req.flash('success_msg', "Home Page Data Add Completed!");
                    return res.redirect('/admin-home');
                });
            }
        } catch (e) {
            logger.error(`Home Page Data Add Error: ${e}`);
            req.flash('error_msg', e.message);
            return res.redirect('/admin-home');
        }
    },//done
    getSignUpPage: async (req, res) => {
        const staticData = await getStaticData(req.session.language);
        res.render('signup', {
            URL: '/signup',
            user: req.session.user,
            staticData: staticData
        });
    },
    getLogInPage: async (req, res) => {
        const staticData = await getStaticData(req.session.language);
        return res.render('login', {
            URL: '/login',
            user: req.session.user,
            staticData: staticData
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
    getAdminShopPage: async (req, res) => {
        res.render('admin/shop', {
            URL: '/admin-shop',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
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
                req.flash('error_msg', error.message);
                return res.redirect('/admin-shop');
            }
            if (!files.length && value.language === 'eng') {
                req.flash('error_msg', "Files is required.!");
                return res.redirect('/admin-shop');
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
                if (value.language === 'eng') {
                    newData.imagesShopSlider = moveFile(files, dir);
                } else {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                    newData.imagesShopSlider = [];
                }
                newData.save((err, result) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-shop');
                    }
                    req.flash('success_msg', "Shop Page Data Add Completed!");
                    return res.redirect('/admin-shop');
                });
            } else {
                if (files.length && value.language === 'eng') {
                    fs.readdir(dir, (error, files) => {
                        if (error) throw error;
                        for (const file of files) {
                            fs.unlink(path.join(dir, file), err => {
                                if (err) throw err;
                            });
                        }
                    });
                } else {
                    files.forEach((file) => {
                        fs.unlink(file.path, err => {
                            if (err) throw err;
                        });
                    })
                }
                myPageData.textShopSlider = value.textShopSlider;
                myPageData.language = value.language;
                if (value.language === "eng") {
                    myPageData.imagesShopSlider = moveFile(files, dir);
                } else {
                    myPageData.imagesShopSlider = [];
                }
                myPageData.save((err, data) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-shop');
                    }
                    req.flash('success_msg', "Shop Page Data Add Completed!");
                    return res.redirect('/admin-shop');
                });
            }
        } catch (e) {
            logger.error(`Shop Page Data Add Error:${e}`);
            req.flash('error_msg', e.message);
            return res.redirect('/admin-shop');
        }
    },//+
    getAdminBrandPage: async (req, res) => {
        res.render('admin/brands', {
            URL: '/admin-brand',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
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
                req.flash('error_msg', error.message);
                return res.redirect('/admin-brand');
            }
            if (!files.length && value.language === 'eng') {
                req.flash('error_msg', "Files is required.!");
                return res.redirect('/admin-brand');
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
                if (value.language === 'eng') {
                    newData.imagesBrandSlider = moveFile(files, dir);
                } else {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                    newData.imagesBrandSlider = [];
                }
                newData.save((err, data) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-brand');
                    }
                    req.flash('success_msg', "Brand Page Data Add Completed!");
                    return res.redirect('/admin-brand');
                });
            } else {
                if (files.length && value.language === 'eng') {
                    fs.readdir(dir, (error, files) => {
                        if (error) throw error;
                        for (const file of files) {
                            fs.unlink(path.join(dir, file), err => {
                                if (err) throw err;
                            });
                        }
                    });
                } else {
                    files.forEach((file) => {
                        fs.unlink(file.path, err => {
                            if (err) throw err;
                        });
                    })
                }
                myPageData.textBrandSlider = value.textBrandSlider;
                myPageData.language = value.language;
                if (value.language === 'eng') {
                    myPageData.imagesBrandSlider = moveFile(files, dir);
                } else {
                    myPageData.imagesBrandSlider = [];
                }
                myPageData.save((err, result) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-brand');
                    }
                    req.flash('success_msg', "Brand Page Data Add Completed!");
                    return res.redirect('/admin-brand');
                });
            }
        } catch (e) {
            logger.error(`Brand Page Data Add Error: ${e}`)
            req.flash('error_msg', "Brand Page Data Add Completed!");
            return res.redirect('/admin-brand');
        }
    },//+
    getAdminBlogPage: async (req, res) => {
        res.render('admin/brands', {
            URL: '/admin-blog', user:
            req.session.user,
            staticData: await getStaticData(req.session.language),
        });
    },
    getAdminAboutPage: async (req, res) => {
        res.render('admin/aboutUs', {
            URL: '/admin-about',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
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
                req.flash('error_msg', error.message);
                return res.redirect('/admin-about');
            }
            if (!files.length && value.language === 'eng') {
                req.flash('error_msg', "Files is required.!");
                return res.redirect('/admin-about');
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
                    titleOurPhilosophy: value.titleOurPhilosophy,
                    ourPhilosophy: value.ourPhilosophy,
                    titleAboutSlider: value.titleOfSlider,
                    language: value.language
                });
                if (value.language === 'eng') {
                    newData.imagesAboutSlider = moveFile(files, dir);
                } else {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                    newData.imagesAboutSlider = [];
                }
                newData.save(function (err, data) {
                    if (err && value.language) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-about');
                    }
                    req.flash('success_msg', "Data About Add Completed!");
                    return res.redirect('/admin-about');
                });
            } else {
                if (files.length && value.language === 'eng') {
                    fs.readdir(dir, (error, files) => {
                        if (error) throw error;
                        for (const file of files) {
                            fs.unlink(path.join(dir, file), err => {
                                if (err) throw err;
                            });
                        }
                    });
                } else {
                    files.forEach((file) => {
                        fs.unlink(file.path, err => {
                            if (err) throw err;
                        });
                    })
                }
                myPageData.textAboutSlider = value.textAboutSlider;
                myPageData.titleOurPhilosophy = value.titleOurPhilosophy;
                myPageData.ourPhilosophy = value.ourPhilosophy;
                myPageData.titleAboutSlider = value.titleAboutSlider;
                myPageData.language = value.language;

                if (value.language === 'eng') {
                    myPageData.imagesAboutSlider = moveFile(files, dir);
                } else {
                    myPageData.imagesAboutSlider = [];
                }
                myPageData.save((err, data) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-about');
                    }
                    req.flash('success_msg', "Data About Add Completed!");
                    return res.redirect('/admin-about');
                });
            }
        } catch (e) {
            logger.error(`About add data error: ${e}`);
            req.flash('success_msg', e.message);
            return res.redirect('/admin-about');
        }
    },//done
    getAdminContactPage: async (req, res) => {
        res.render('admin/contactUs', {
            URL: '/admin-contact',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
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
                req.flash('error_msg', error.message);
                return res.redirect('/admin-contact');
            }
            if (!files.length && value.language === 'eng') {
                req.flash('error_msg', "Files is required.!");
                return res.redirect('/admin-contact');
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
                if (value.language === 'eng') {
                    newData.imagesContactSlider = moveFile(files, dir);
                } else {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                    newData.imagesContactSlider = [];
                }
                newData.save((err, result) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-contact');
                    }
                    req.flash('success_msg', 'Contact Page Data Add Completed!');
                    return res.redirect('/admin-contact');
                });
            } else {
                if (files.length && value.language === 'eng') {
                    fs.readdir(dir, (error, files) => {
                        if (error) throw error;
                        for (const file of files) {
                            fs.unlink(path.join(dir, file), err => {
                                if (err) throw err;
                            });
                        }
                    });
                } else {
                    files.forEach((file) => {
                        fs.unlink(file.path, err => {
                            if (err) throw err;
                        });
                    })
                }
                myPageData.textContactSlider = value.textContactSlider;
                myPageData.imagesContactSlider = value.imagesContactSlider;
                myPageData.language = value.language;
                if (value.language === 'eng') {
                    myPageData.imagesContactSlider = moveFile(files, dir);
                } else {
                    myPageData.imagesContactSlider = [];
                }
                myPageData.save((err, data) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-contact');
                    }
                    req.flash('success_msg', 'Contact Page Data Add Completed!');
                    return res.redirect('/admin-contact');
                });
            }
        } catch (e) {
            logger.error(`Contact Page Data Add Error: ${e}`)
            req.flash('error_msg', e.message);
            return res.redirect('/admin-contact');
        }
    },//done
    getAdminJoinOurTeamPage: async (req, res) => {
        res.render('admin/joinOurTeam', {
            URL: '/admin-join-our-team',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
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
                req.flash('error_msg', error.message);
                return res.redirect('/admin-join-our-team');
            }
            if (!files.length && value.language === 'eng') {
                req.flash('error_msg', 'Files is required.!');
                return res.redirect('/admin-join-our-team');
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
                if (value.language === 'eng') {
                    newData.imagesJoinOurTeamSlider = moveFile(files, dir);
                } else {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                    newData.imagesJoinOurTeamSlider = [];
                }
                newData.save((err, result) => {
                    if (err) {
                        if (value.language === 'eng') {
                            fs.readdir(dir, (error, files) => {
                                if (error) throw error;
                                for (const file of files) {
                                    fs.unlink(path.join(dir, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }

                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-join-our-team');
                    }
                    req.flash('success_msg', "JoinOurTeam Page Data Add Completed!");
                    return res.redirect('/admin-join-our-team');
                });
            } else {
                if (files.length && value.language === 'eng') {
                    fs.readdir(dir, (error, files) => {
                        if (error) throw error;
                        for (const file of files) {
                            fs.unlink(path.join(dir, file), err => {
                                if (err) throw err;
                            });
                        }
                    });
                } else {
                    files.forEach((file) => {
                        fs.unlink(file.path, err => {
                            if (err) throw err;
                        });
                    })
                }
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

                if (value.language === 'eng') {
                    myPageData.imagesJoinOurTeamSlider = moveFile(files, dir);
                } else {
                    myPageData.imagesJoinOurTeamSlider = [];
                }
                myPageData.save((err, result) => {
                    if (err && value.language === 'eng') {
                        fs.readdir(dir, (error, files) => {
                            if (error) throw error;
                            for (const file of files) {
                                fs.unlink(path.join(dir, file), err => {
                                    if (err) throw err;
                                });
                            }
                        });
                        req.flash('error_msg', err.message);
                        return res.redirect('/admin-join-our-team');
                    }
                    req.flash('success_msg', "JoinOurTeam Page Data Add Completed!");
                    return res.redirect('/admin-join-our-team');
                });
            }
        } catch (e) {
            logger.error(`JoinOurTeam Page Data Add Error:${e}`);
            req.flash('error_msg', e.message);
            return res.redirect('/admin-join-our-team');
        }
    },//done
    getAdminAddBrandPage: async (req, res) => {
        res.render('admin/addBrand', {
            URL: '/admin-create-brand',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
        });
    },
    getAdminAddProductPage: async (req, res) => {
        try {
            const brands = await Brand.find({language: req.session.language}).select('name _id');

            res.render('admin/addProduct', {
                URL: 'admin-create-product',
                user: req.session.user,
                brands: brands,
                staticData: await getStaticData(req.session.language),
            });
        } catch (e) {
            return res.status(500).json(err(e.message, res.statusCode));
        }

    },
    getAdminOurBrandsPage: async (req, res) => {
        res.render('admin/ourBrands', {
            URL: '/admin-all-brands',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
        });
    },
    getAdminOurProductsPage: async (req, res) => {
        res.render('admin/ourProducts', {
            URL: '/admin-all-products',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
        });
    },
    editProduct: async (req, res) => {
        try {
            const {_id} = req.query;
            const product = await Product.find({_id: _id}).lean().exec();
            res.render('admin/editProduct', {
                URL: '/admin-editProduct',
                user: req.session.user,
                product: product[0],
                staticData: await getStaticData(req.session.language),
            })
        } catch (e) {
            console.log(e)
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    editBrand: async (req, res) => {
        logger.info('Start edit brand - - -');
        try {
            const {_id} = req.query;
            const brand = await Brand.find({_id: _id}).lean().exec();
            res.render('admin/editBrand', {
                URL: '/admin-editBrand',
                user: req.session.user,
                brand: brand[0],
                staticData: await getStaticData(req.session.language),
            })
        } catch (e) {
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    getShipping: async (req, res) => {
        logger.info('Start Shipping address get - - -');
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            res.render('shippingAddress', {
                URL: '/shipping',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
            })
        } catch (e) {
            console.log(e)
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }

    },
    forgotPassword: async (req, res) => {
        logger.info('Start Forgot Password api - - - ');
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            res.render('forgotPassword', {
                URL: '/forgotPassword',
                user: req.session.user,
                staticData: await getStaticData(req.session.language)
            })
        } catch (e) {
            logger.error(`Forgot Password Error:${e}`);
            req.flash("error_msg", e.message);
            return res.redirect("/login");
        }
    },
    sendEmailForgotPassword: async (req, res) => {
        logger.info('Start sendEmailForgotPassword api - - ');
        try {
            const {email} = req.body;
            const user = await User.findOne({email: email});
            if (!user) {
                req.flash('error_msg', 'User with this email already exists');
                return res.redirect('/forgotPassword');
            }
            const {_id} = user
            const token = jwt.sign({_id}, process.env.SECRET_KEY, {expiresIn: '1m'});
            const data = {
                from: process.env.MAIL_AUTH_EMAIL,
                to: email,
                subject: `Forgot Password link`,
                html: `
                     <h2>Please click on given link to reset your password</h2>
                     <button>
                            <a href="${`http://localhost`}/resetPassword/${token}"> Reset Password</a>
                     </button>
`
            }
            sendMessageToMail(data);
            req.flash('success_msg', 'Link send to mail');
            return res.redirect('/forgotPassword');
        } catch (e) {
            logger.error(`Send Forgot Password Error:${e}`);
            req.flash("error_msg", e.message);
            return res.redirect("/forgotPassword");
        }
    },
    getresetPassword: async (req, res) => {
        const staticData = await getStaticData(req.session.language);
        const userId = JSON.parse(localStorage.getItem('userId'))
        localStorage.removeItem('userId');

        return res.render('resetPassword', {
            URL: '/resetPassword',
            user: req.session.user,
            staticData: staticData,
            userId: userId,
        })
    },
    resetPassword: async (req, res) => {
        try {
            logger.info('Start Reset Password api - - -');
            const {token} = req.params;
            const staticData = await getStaticData(req.session.language);
            jwt.verify(token, process.env.SECRET_KEY, function (err, decodedData) {
                if (err) {
                    req.flash('error_msg', 'Incorrect token or it is expired');
                    return res.redirect('/forgotPassword');
                }
                localStorage.setItem('userId', JSON.stringify(decodedData._id));
                return res.redirect('/reset-password');
            })

        } catch (e) {
            logger.error(`Start Reset Password Error:${e}`);

        }
    },
    userResetPassword: async (req, res) => {
        try {
            logger.info('Start userResetPAssword - - -');
            const {password, confirmPassword, userId} = req.body;
            if (password != confirmPassword) {
                req.flash("error_msg", 'Password Does Not Match!');
                return res.redirect('/reset-password');
            }
            let hash = bcrypt.hashSync(password, 10);
            const result = await User.updateOne({_id: userId}, {password: hash});
            req.flash('success_msg', 'Password is updated you can login');
            return res.redirect('/login');
        } catch (e) {
            logger.error(`Updated Password Error:${e}`);
            req.flash('error_msg', e.message);
            return res.redirect('/reset-password');
        }
    },
    getDelevry: async (req, res) => {
        logger.info('Start Get Data Page Delevry - - -');
        try {
            const staticData = await getStaticData(req.session.language);
            let langPage = 'delevry'
            if (req.session.language === 'arm') {
                langPage = 'delevryARM'
            }
            return res.render(langPage, {
                URL: `/${langPage}`,
                user: req.session.user,
                staticData: staticData,
            });
        } catch (e) {
            logger.error(`Start Get Data Page Delevry Error:${e}`);
            req.flash('error_msg', e.message);
            return res.redirect('/');
        }

    },
    getPrivacyPolicy: async (req, res) => {
        logger.info('Start Get Data Page privacyPolicy - - -');
        try {
            const staticData = await getStaticData(req.session.language);
            let langPage = 'privacyPolicy';
            if (req.session.language === 'arm') {
                langPage = 'privacyPolicyARM';
            }
            return res.render(langPage, {
                URL: `/${langPage}`,
                user: req.session.user,
                staticData: staticData,
            });
        } catch (e) {
            logger.error(`Start Get Data Page privacyPolicy Error:${e}`);
            req.flash('error_msg', e.message);
            return res.redirect('/');
        }
    },
    getTermAndConditions: async (req, res) => {
        logger.info('Start Get Data Page termAndConditions - - -');
        try {
            const staticData = await getStaticData(req.session.language);
            let langPage = 'termAndConditions';
            if (req.session.language === 'arm') {
                langPage = 'termAndConditionsARM';
            }
            return res.render(langPage, {
                URL: `/${langPage}`,
                user: req.session.user,
                staticData: staticData,
            });
        } catch (e) {
            logger.error(`Start Get Data Page termAndConditions Error:${e}`);
            req.flash('error_msg', e.message);
            return res.redirect('/');
        }
    },

    getCheckouts: async (req, res) => {
        try {
            logger.info('Start get checkout page.');

            localStorage.setItem(`order${req.session.user._id}`, req.body.order);
            localStorage.setItem(`shippingAddress${req.session.user._id}`, req.body.shippingAddress);
            const staticData = await getStaticData(req.session.language);
            let sum = 0;
            JSON.parse(req.body.order).forEach((item) => {
                sum += Number(item.priceSale.substring(0, item.priceSale.length - 1))
            });
            sum += Number(JSON.parse(req.body.shippingAddress).deliveryPrice);
            let names = '';
            const order = JSON.parse(req.body.order)
            order.forEach((item) => {
                names += item.name + ' ';
            })


            return res.render('checkouts', {
                URL: `/checkouts`,
                user: req.session.user,
                key: process.env.STRIPE_PUBLIC_KEY,
                sum: sum,
                names: names,
                staticData: staticData,
            });
        } catch (e) {
            console.log(e);
        }
    }
};