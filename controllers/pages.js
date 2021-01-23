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
const {moveFile, getStaticData} = require('../utils/helper');
const PageData = require('../models/pagesData');
const Brand = require('../models/brands');
const Product = require('../models/product');
const User = require('../models/user')
const {logger} = require('../utils/logger')

module.exports = {
    changeLanguage: async (req, res) => {
        console.log('Start changeLanguage');
        req.session.language = req.body.language;
        res.end();
    },
    getUserDashboard: async (req, res, next) => {
        try {
            // let staticData =
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
            console.log(e);
        }
    },//done
    getAboutPage: async (req, res) => {
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
    },
    getBlogPage: async (req, res) => {
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
    },//done
    getShopPage: async (req, res) => {
        logger.info('Start Shop get - - -');
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        try {
            const pageData = await PageData.find({language: req.session.language}).select('textShopSlider imagesShopSlider -_id').exec();
            const productsType = await Product.find({language: req.session.language}).distinct('type').exec();
            const brands = await Brand.find({language: req.session.language}).select('name').exec();
            const type = req.query.type || null;
            const brandId = req.query.brandId || null;
            res.render('shop', {
                URL: '/shop',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
                pageData: pageData,
                productsType: productsType,
                brands: brands,
                type: type,
                brandId: brandId,
            });
        } catch (e) {
            console.log(`Get Brands Error: ${e}`)
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    getSelectedProducts: async (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        res.render('selectedProducts', {
            URL: '/selectedProducts',
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
        });
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
            return res.redirect("/shop");
        }
    },
    getBrandPage: async (req, res) => {
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
        } catch (err) {
            req.flash("error_msg", err.message);
            return res.redirect("/brand");
        }
    },//done
    getContactPage: async (req, res) => {
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
    },
    getJoinOurTeamPage: async (req, res) => {
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
        } catch (err) {
            req.flash("error_msg", err.message);
            return res.redirect("/join-our-team");
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
                req.flash('error_msg', 'Files is required.!');
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
                    newData.homeSliderImages = [];
                }
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
                    req.flash('success_msg', "Home Page Data Add Completed!");
                    return res.redirect('/admin-home');
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
                if (value.language === 'eng') {
                    myPageData.homeSliderImages = moveFile(files, dir);
                } else {
                    myPageData.homeSliderImages = [];
                }
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
        res.render('signup', {
            user: req.session.user,
            staticData: await getStaticData(req.session.language),
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
            if (!files.length) {
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
                    req.flash('success_msg', "Shop Page Data Add Completed!");
                    return res.redirect('/admin-shop');
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
                    newData.imagesBrandSlider = [];
                }
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
                    req.flash('success_msg', "Brand Page Data Add Completed!");
                    return res.redirect('/admin-brand');
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
                if (value.language === 'eng') {
                    myPageData.imagesBrandSlider = moveFile(files, dir);
                } else {
                    myPageData.imagesBrandSlider = [];
                }
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
            if (!files.length && value.language) {
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
                    textAboutGeneralImage: value.textAboutSlider,
                    titleOurPhilosophy: value.titleOurPhilosophy,
                    ourPhilosophy: value.ourPhilosophy,
                    titleAboutSlider: value.titleOfSlider,
                    language: value.language
                });
                // if (value.language === 'eng') {
                newData.imagesAboutSlider = moveFile(files, dir);
                // } else {
                //     newData.imagesAboutSlider = [];
                // }
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
                    req.flash('success_msg', "Data About Add Completed!");
                    return res.redirect('/admin-about');
                });
            } else {
                myPageData.textAboutSlider = value.textAboutSlider;
                myPageData.ourPhilosophy = value.ourPhilosophy;
                myPageData.textOnAboutSlider = value.titleOfSlider;
                myPageData.language = value.language;
                fs.readdir(dir, (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                    }
                });
                // if (value.language === 'eng') {
                myPageData.imagesAboutSlider = moveFile(files, dir);
                // } else {
                //     files.map((file) => {
                //         rimraf(`./public/uploads/${file.filename}`, (err) => {
                //             if (err) console.log(err);
                //         })
                //     });
                //     myPageData.imagesAboutSlider = [];
                // }
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
                    req.flash('success_msg', 'Contact Page Data Add Completed!');
                    return res.redirect('/admin-contact');
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
                if (value.language === 'eng') {
                    myPageData.imagesContactSlider = moveFile(files, dir);
                } else {
                    myPageData.imagesContactSlider = [];
                }
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
                files.map((file) => {
                    rimraf(`./public/uploads/${file.filename}`, (err) => {
                        if (err) console.log(err);
                    })
                });
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
                if (value.language === 'eng') {
                    myPageData.imagesJoinOurTeamSlider = moveFile(files, dir);
                } else {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) console.log(err);
                        })
                    });
                    myPageData.imagesJoinOurTeamSlider = [];
                }
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

    }
};