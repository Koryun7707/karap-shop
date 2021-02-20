require('dotenv').config();
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const {err} = require('../utils/responseApi');
const ejs = require('ejs');
const {
    validateHomeData,
    validateShopData,
    validateBrandData,
    validateAboutData,
    validateContactData,
    validateJoinOurTeamData,
    validateBlogData
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
const Blog = require('../models/blog');
const ShippingAddress = require('../models/shipingAddress');
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./userStorage');

module.exports = {
    changeLanguage: async (req, res) => {
        logger.info('Start changeLanguage');
        req.session.language = req.body.language;
        res.end();
    },
    getUserDashboard: async (req, res, next) => {
        logger.info(`Start getUserDashboard Page Data - - -`);
        try {
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            if (req.user) {
                const userObjWithoutPassword = {
                    _id: req.user._id,
                    status: req.user.status,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    email: req.user.email,
                    roleType: req.user.roleType,
                    avatar: req.user.avatar,
                    id: req.user._id,
                }
                req.session.user = userObjWithoutPassword;
            }
            let pageData = await PageData.find({language: req.session.language}).select('homeSliderImages homeSliderText homeProductTypeTitle').exec();
            if (req.session.language !== 'eng' && pageData.length) {
                const arrayImages = await PageData.findOne({language: 'eng'}).select('homeSliderImages').exec();
                pageData[0].homeSliderImages = arrayImages.homeSliderImages;
            }
            let products
            if (req.session.language === 'eng') {
                products = await Product.find({}).select('images name type').exec();
                products = [...new Map(products.map(item =>
                    [item['type'], item])).values()];
            } else {
                products = await Product.find({}).select('images nameArm typeArm').exec();
                products = [...new Map(products.map(item =>
                    [item['typeArm'], item])).values()];
            }
            const countOfBrands = await Brand.find({}).exec();
            res.render('index', {
                URL: '/',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
                pageData: pageData,
                products: products,
                pages: countOfBrands.length,
                language:req.session.language
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
            const blog = await Blog.find({language: req.session.language}).exec();
            res.render('blog', {
                URL: '/blog',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
                blog: blog
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
            let productsType;
            if (req.session.language === 'eng') {
                productsType = await Product.find({}).distinct('type').exec();
            } else {
                productsType = await Product.find({}).distinct('typeArm').exec();
            }
            const brands = await Brand.find({}).select('name').exec();
            let maxPrice = await Product.find({}).select('-_id price');
            maxPrice = Math.max.apply(Math, maxPrice.map(function (o) {
                return o.price;
            }))
            const countSale = await Product.count({sale: {$exists: true}}).exec();
           // const type = req.query.type || null;
            let type = ''
            for (const key in req.query) {
                type+= req.query[key];
                if(key!='type'){
                    type+=key;
                }
                type+='&'
            }
            type= type.substring(0,type.length-1)
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
                maxPrice: maxPrice,
                countSale: countSale,
            });
        } catch (e) {
            logger.info(`Get Brands Error: ${e}`)
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
            if (req.session.language === undefined) {
                req.session.language = 'eng';
            }
            const {_id} = req.query;
            const product = await Product.find({_id}).lean().exec();
            res.render('product', {
                URL: '/product',
                user: req.session.user,
                product: product,
                staticData: await getStaticData(req.session.language),
                language: req.session.language
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
            if (req.user) {
                const userObjWithoutPassword = {
                    _id: req.user._id,
                    status: req.user.status,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    email: req.user.email,
                    roleType: req.user.roleType,
                    avatar: req.user.avatar,
                    id: req.user._id,
                }
                req.session.user = userObjWithoutPassword;
            }
            let pageData = await PageData.find({language: req.session.language}).select('imagesBrandSlider textBrandSlider').exec();
            if (req.session.language !== 'eng' && pageData.length) {
                const arrayImages = await PageData.findOne({language: 'eng'}).select('imagesBrandSlider').exec();
                pageData[0].imagesBrandSlider = arrayImages.imagesBrandSlider;
            }
            const brands = await Brand.find({}).select('info name images');
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
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
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
                if (req.session.language = 'eng') {
                    req.flash('error_msg', "Files is required.!");
                } else {
                    req.flash('error_msg', 'Ֆայլերը պարտադիր են:');
                }
                return res.redirect('/admin-home');
            }
            const myPageData = await PageData.findOne({language: value.language}).exec();
            let dir = `./public/uploads/home`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) console.log(err);
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
                        if (req.session.language === 'eng') {
                            req.flash('success_msg', "Home page data add completed!");
                        } else {
                            req.flash('success_msg', "Հիմնական էջի տվյալներն ավելացված են:!");
                        }
                        return res.redirect('/admin-home');
                    }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "Home page data add completed!");
                    } else {
                        req.flash('success_msg', "Հիմնական էջի տվյալներն ավելացված են:!");
                    }
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
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        const staticData = await getStaticData(req.session.language);
        res.render('signup', {
            URL: '/signup',
            user: req.session.user,
            staticData: staticData
        });
    },
    getLogInPage: async (req, res) => {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
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
                if (req.session.language === 'eng') {
                    req.flash('error_msg', "Files is required.!");
                } else {
                    req.flash('error_msg', "Ֆայլեր պահանջվում են!:");
                }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "Shop Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Խանութի էջի տվյալների ավելացումն ավարտված է:\n!");
                    }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "Shop Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Խանութի էջի տվյալների ավելացումն ավարտված է:");
                    }
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
                if (req.session.language === 'eng') {
                    req.flash('error_msg', "Files is required.!");
                } else {
                    req.flash('error_msg', "Ֆայլեր պահանջվում են:");
                }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "Brand Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Ապրանքանիշի էջի տվյալների ավելացումն ավարտված է:");
                    }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "Brand Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Ապրանքանիշի էջի տվյալների ավելացումն ավարտված է:");
                    }
                    return res.redirect('/admin-brand');
                });
            }
        } catch (e) {
            logger.error(`Brand Page Data Add Error: ${e}`)
            req.flash('error_msg', e.message);
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
                if (req.session.language === 'eng') {
                    req.flash('error_msg', "Files is required.!");
                } else {
                    req.flash('error_msg', "Ֆայլեր պահանջվում են:");
                }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "About Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Մեր մասին էջի տվյալների ավելացումն ավարտված է:");
                    }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "About Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Մեր մասին էջի տվյալների ավելացումն ավարտված է:");
                    }
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
                if (req.session.language === 'eng') {
                    req.flash('error_msg', "Files is required.!");
                } else {
                    req.flash('error_msg', "Ֆայլեր պահանջվում են:");
                }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "Contact Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Կապվեք մեզ հետ էջի տվյալների ավելացումն ավարտված է:");
                    }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "Contact Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Կապվեք մեզ հետ էջի տվյալների ավելացումն ավարտված է:");
                    }
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
                if (req.session.language === 'eng') {
                    req.flash('error_msg', "Files is required.!");
                } else {
                    req.flash('error_msg', "Ֆայլեր պահանջվում են:");
                }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "JoinOurTeam Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Միացեք մեր թիմին էջի տվյալների ավելացումն ավարտված է:");
                    }
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
                    if (req.session.language === 'eng') {
                        req.flash('success_msg', "JoinOurTeam Page Data Add Completed!");
                    } else {
                        req.flash('success_msg', "Միացեք մեր թիմին էջի տվյալների ավելացումն ավարտված է:");
                    }
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
            const brands = await Brand.find({}).select('name _id');

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
            const brands = await Brand.find({}).select('name _id')
            res.render('admin/editProduct', {
                URL: '/admin-editProduct',
                user: req.session.user,
                product: product[0],
                brands:brands,
                staticData: await getStaticData(req.session.language),
            })
        } catch (e) {
            logger.info(e)
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
    editBlog: async (req, res) => {
        logger.info('Start edit blog - - -');
        try {
            const {_id} = req.query;
            const blog = await Blog.find({_id: _id}).lean().exec();
            res.render('admin/editBlog', {
                URL: '/admin-editBlog',
                user: req.session.user,
                blog: blog[0],
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
            logger.info(e)
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
                if (req.session.language === 'eng') {
                    req.flash('error_msg', 'User with this email not exist.');
                } else {
                    req.flash('error_msg', "Այս էլ.փոստով օգտվողը գոյություն չունի:");
                }
                return res.redirect('/forgotPassword');
            }
            const {_id} = user
            const token = jwt.sign({_id}, process.env.SECRET_KEY, {expiresIn: '5m'});
            const data = {
                from: process.env.MAIL_AUTH_EMAIL,
                to: email,
                subject: `Forgot Password link`,
                html: `
                     <h2>Please click on given link to reset your password</h2>
                     <button>
                            <a href="https://armatconcept.com/resetPassword/${token}"> Reset Password</a>
                     </button>
`
            }
            sendMessageToMail(data);
            if (req.session.language === 'eng') {
                req.flash('success_msg', 'Link send to email post.');
            } else {
                req.flash('success_msg', 'Հղումը ուղարկել էլ. Փոստին:');

            }
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
            jwt.verify(token, process.env.SECRET_KEY, function (err, decodedData) {
                if (err) {
                    if (req.session.language === 'eng') {
                        req.flash('error_msg', 'Link time is expired!');
                    } else {
                        req.flash('error_msg', 'Հղման ժամանակը սպառվել է:');
                    }
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
                if (req.session.language === 'eng') {
                    req.flash("error_msg", 'Password does not match!');
                } else {
                    req.flash('error_msg', 'Գաղտնաբառը չի համապատասխանում!');
                }
                return res.redirect('/reset-password');
            }
            let hash = bcrypt.hashSync(password, 10);
            const result = await User.updateOne({_id: userId}, {password: hash});
            if (req.session.language === 'eng') {
                req.flash('success_msg', 'Password is changed you can login.');
            } else {
                req.flash('success_msg', 'Գաղտնաբառը փոխվել է, դուք կարող եք մուտք գործել:');
            }
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
    },
    getAdminBlog: async (req, res) => {
        try {
            res.render('admin/adminBlog', {
                URL: '/admin-blog',
                user: req.session.user,
                staticData: await getStaticData(req.session.language),
            })
        } catch (e) {
            console.log(e)
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    createAdminBlog: async (req, res) => {
        logger.info('Start Create Blog - - -');
        try {
            const files = req.files;
            const {error, value} = validateBlogData(req.body);
            if (error) {
                if (files.length > 0) {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) logger.error(err)
                        })
                    });
                }
                req.flash("error_msg", error.message);
                return res.redirect("/admin-blog");
            }
            if (files.length !== 2 && value.language === 'eng') {
                files.map((file) => {
                    rimraf(`./public/uploads/${file.filename}`, (err) => {
                        if (err) logger.error(err)
                    })
                });
                if (req.session.language === 'eng') {
                    req.flash("error_msg", "Files is required!");
                } else {
                    req.flash("error_msg", "Ֆայլերը պարտադիր են!");
                }
                return res.redirect("/admin-blog");
            }
            let dir = `./public/uploads/blog`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) logger.error(err);
                });
            }
            const blog = new Blog({
                infoBlog: value.infoBlog,
                textBlogTitle: value.textBlogTitle,
                title1: value.title1,
                title2: value.title2,
                language: value.language,
            });
            blog.blogImages = moveFile(files, dir);
            blog.save((err, result) => {
                if (err) {
                    files.map((file) => {
                        rimraf(`${dir}/${file.filename}`, (err) => {
                            if (err) logger.error(err);
                        })
                    });
                    req.flash("error_msg", err.message);
                    return res.redirect("/admin-blog");
                }
                if (req.session.language === 'eng') {
                    req.flash("success_msg", "Blog Data added complete!");
                } else {
                    req.flash('success_msg', 'Բլոգի տվյալներն ավելացված են:');
                }
                return res.redirect("/admin-blog");
            });
        } catch (e) {
            req.flash("error", e.message);
            return res.redirect("/admin-blog");
        }
    },
    deleteBlog: async (req, res) => {
        logger.info('Start Delete Blog - - -');
        const {id} = req.params;
        try {
            //code must be changed, and optimized
            const blog = await Blog.findById({_id: id}).lean();

            blog.blogImages.map((item) => {
                rimraf(`./public/${item}`, (err) => {
                    if (err) logger.error(err)
                })
            });

            await Blog.findByIdAndRemove({_id: id}).lean();
            return res.status(200).json({success: true, message: 'Delete Blog Completed'});
        } catch (e) {
            logger.error(`Blog Delete Error: ${e}`);
            req.flash("error", e.message);
            return res.redirect("/admin-blog");
        }
    },
    getAllBlogsData: async (req, res) => {
        logger.info('Start Get All Blog Data - - -');
        try {
            const blogs = await Blog.find({}).lean().exec();
            res.render('admin/ourBlogs', {
                URL: '/admin-all-blogs',
                user: req.session.user,
                blogs: blogs,
                staticData: await getStaticData(req.session.language),
            })
        } catch (e) {
            logger.error(`Blog Get All Error: ${e}`);
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    updateBlog: async (req, res) => {
        logger.info('Start Blog update - - -');
        try {
            const _id = req.params._id;
            const files = req.files;
            const blog = await Blog.findById(_id).exec();
            const {error, value} = validateBlogData(req.body);
            if (error && error.details) {
                logger.error(`Validate Error: ${error}`);
                if (files.length > 0) {
                    files.map((file) => {
                        rimraf(`./public/uploads/${file.filename}`, (err) => {
                            if (err) logger.error(err)
                        })
                    });
                }
                req.flash("error_msg", error.message);
                return res.redirect(`/admin-editBlog?_id=${_id}`);
            }
            if (files.length !== 2) {
                files.map((file) => {
                    rimraf(`./public/uploads/${file.filename}`, (err) => {
                        if (err) logger.error(err)
                    })
                });
                if (req.session.language === 'eng') {
                    req.flash("error_msg", "Files is required!");
                } else {
                    req.flash("error_msg", "Ֆայլերը պարտադիր են!");
                }
                return res.redirect(`/admin-editBlog?_id=${_id}`);
            }
            let dir = `./public/uploads/blog`;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) logger.error(err)
                });
            }
            blog.infoBlog = value.infoBlog
            blog.textBlogTitle = value.textBlogTitle
            blog.title1 = value.title1
            blog.title2 = value.title2
            blog.language = value.language
            blog.blogImages.map((item) => {
                rimraf(`./public/${item}`, (err) => {
                    if (err) logger.error(err)
                })
            });
            blog.blogImages = moveFile(files, dir);
            blog.save((err, result) => {
                if (err) {
                    files.map((file) => {
                        rimraf(`${dir}/${file.filename}`, (err) => {
                            if (err) logger.error(err);
                        })
                    });
                    req.flash("error_msg", err.message);
                    return res.redirect(`/admin-editBlog?_id=${_id}`);
                }
                if (req.session.language === 'eng') {
                    req.flash("success_msg", 'Blog update completed!');
                } else {
                    req.flash("success_msg", 'Բլոգի թարմացումն ավարտված է!');
                }
                return res.redirect(`/admin-editBlog?_id=${_id}`);
            });

        } catch (e) {
            const _id = req.params._id;
            logger.error(`Blog Update Error: ${e}`);
            req.flash("error_msg", e.message);
            return res.redirect(`/admin-editBlog?_id=${_id}`);
        }
    },
    getSendMailShipping:async (req, res) => {
        logger.info('Start sendMailShipping - - -');
        try {
            const {email,name,_id} = req.query;
            res.render('admin/sendShippingAddress', {
                URL: '/admin-sendMailShipping',
                user: req.session.user,
                email:email,
                firstName:name,
                shippingId:_id,
                staticData: await getStaticData(req.session.language),
            })
        } catch (e) {
            logger.error(`sendMailShipping: ${e}`);
            req.flash("error_msg", e.message);
            return res.redirect("/");
        }
    },
    postSendMailShipping:async (req, res) => {
        logger.info('Start sendMailShipping - - -');
        try {
            const {email,orderId,firstName,shippingId,date,shippingMethod} = req.body;
            const shipping = await ShippingAddress.findById({_id:shippingId}).populate('userId');
            await ShippingAddress.updateOne({_id:shippingId},{status:true},{upsert: true})
            let subTotal = 0;
            shipping.productIds.forEach((item) => {
                subTotal += Number(item.priceSale.substring(0, item.priceSale.length - 1));
            });
            let amount = (Number(subTotal) + Number(shipping.deliveryPrice));
            ejs.renderFile("./orderEmailTemplateUser.ejs", {
                name: firstName,
                lastName:shipping.userId.lastName,
                email: shipping.userId.email,
                shippingDate:shipping.date,
                phone: shipping.phone,
                city: shipping.city,
                country: shipping.country,
                apartment: shipping.apartment,
                address: shipping.address,
                date: date,
                orderId: orderId,
                order: shipping.productIds,
                subTotal: subTotal.toFixed(2),
                shipping: shipping.deliveryPrice,
                total: amount.toFixed(2),
                shippingMethod:shippingMethod,
                shippingId:shipping._id
            }, function (err, data) {
                if (err) {
                    logger.error(`sendMailShipping: ${err}`);
                    req.flash("error_msg", err.message);
                    return res.redirect("/admin-sendMailShipping");

                } else {
                    const attachments = [];
                    shipping.productIds.forEach((item) => {
                        attachments.push({
                            filename: item.images.split('/')[2],
                            path: `./public/${item.images}`,
                            cid: item.productId
                        })
                    })
                    attachments.push({
                        filename: '2Armatconcept.png',
                        path: `./public/images/2Armatconcept.png`,
                        cid: '2Armatconcept'
                    })
                    const messageUser = {
                        from: process.env.MAIL_AUTH_EMAIL,
                        to: email,
                        subject: 'Thank you for your order',
                        html: data,
                        attachments: attachments
                    }
                    sendMessageToMail(messageUser)
                }
            });
            req.flash('success_msg',`Order Id Send To Mail:${email}`)
            return res.redirect(`/admin-sendMailShipping?email=${email}`);
        } catch (e) {
            logger.error(`sendMailShipping: ${e}`);
            req.flash("error_msg", e.message);
            return res.redirect("/admin-sendMailShipping");
        }
    },
};








