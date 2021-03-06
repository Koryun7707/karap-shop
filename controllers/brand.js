const rimraf = require('rimraf');
const fs = require('fs');
const {logger} = require('../utils/logger');
const {validateBrand} = require('../validations/brand');
const Brand = require('../models/brands');
const Product = require('../models/product');
const {success, err} = require('../utils/responseApi');
const {moveFile} = require('../utils/helper');


const createBrand = async (req, res) => {
    logger.info('Start createBrand - - -');
    try {
        const files = req.files;
        const {error, value} = validateBrand(req.body);
        if (error) {
            if (files.length > 0) {
                files.map((file) => {
                    rimraf(`./public/uploads/${file.filename}`, (err) => {
                        if (err) logger.error(err)
                    })
                });
            }
            req.flash("error_msg", error.message);
            return res.redirect("/admin-create-brand");
        }
        if (files.length !== 3 && value.language === 'eng') {
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
            return res.redirect("/admin-create-brand");
        }
        let dir = `./public/uploads/brands`;
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) logger.error(err);
            });
        }
        const brand = new Brand({
            name: value.brandName,
            info: value.brandInfo,
            infoArm: value.brandInfoArm,
            type: value.brandType,
            typeArm: value.brandTypeArm,
            registrationAddress: value.registrationAddress,
        });
        brand.images = moveFile(files, dir);
        brand.save((err, result) => {
            if (err) {
                files.map((file) => {
                    rimraf(`${dir}/${file.filename}`, (err) => {
                        if (err) logger.error(err);
                    })
                });
                req.flash("error_msg", err.message);
                return res.redirect("/admin-create-brand");
            }
            req.flash("success_msg", "Brand add complete!");
            return res.redirect("/admin-create-brand");
        });
    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/admin-create-brand");
    }
};

const deleteBrand = async (req, res) => {
    logger.info('Start deleteBrand - - -');
    const {id} = req.params;
    try {
        //code must be changed, and optimized
        const brand = await Brand.findById(id).populate('products').lean();

        if (brand.products.length > 0) {
            brand.products.forEach((item) => {
                if (item.images.length) {
                    item.images.map((item) => {
                        rimraf(`./public/${item}`, (err) => {
                            if (err) logger.error(err);
                        })
                    })
                }
            });
            brand.products.map(async (item) => {
                await Product.findByIdAndRemove({_id: item._id}).lean();
            })
        }

        brand.images.map((item) => {
            rimraf(`./public/${item}`, (err) => {
                if (err) logger.error(err)
            })
        });

        await Brand.findByIdAndRemove({_id: id}).lean();
        return res.status(200).json({success: true, message: 'Delete Brand Completed'});
    } catch (e) {
        logger.error(`Brand Delete Error: ${e}`);
        req.flash("error", e.message);
        return res.redirect("/admin-all-brands");
    }
}

const updateBrand = async (req, res) => {
    logger.info('Start Brand update - - -');
    try {
        const _id = req.params._id;
        const files = req.files;
        const brand = await Brand.findById(_id).exec();
        const {error, value} = validateBrand(req.body);
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
            return res.redirect(`/admin-editBrand?_id=${_id}`);
        }
        if (files.length !== 3) {
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
            return res.redirect(`/admin-editBrand?_id=${_id}`);
        }
        let dir = `./public/uploads/brands`;
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) logger.error(err)
            });
        }
        brand.name = value.brandName;
        brand.info = value.brandInfo;
        brand.infoArm = value.brandInfoArm;
        brand.type = value.brandType;
        brand.typeArm = value.brandTypeArm;
        brand.registrationAddress = value.registrationAddress;
        brand.images.map((item) => {
            rimraf(`./public/${item}`, (err) => {
                if (err) logger.error(err)
            })
        });
        brand.images = moveFile(files, dir);
        brand.save((err, result) => {
            if (err) {
                files.map((file) => {
                    rimraf(`${dir}/${file.filename}`, (err) => {
                        if (err) logger.error(err);
                    })
                });
                req.flash("error_msg", err.message);
                return res.redirect(`/admin-editBrand?_id=${_id}`);
            }
            req.flash("success_msg", 'Brand Update Completed!');
            return res.redirect(`/admin-editBrand?_id=${_id}`);
        });

    } catch (e) {
        const _id = req.params._id;
        logger.error(`Brand Update Error: ${e}`);
        req.flash("error_msg", e.message);
        return res.redirect(`/admin-editBrand?_id=${_id}`);
    }
}

const getBrands = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 8;
        
        const options = {
            page: page,
            limit: limit,
        }
        const results = await Brand.paginate({}, options);
        return res.status(200).json(success('success', {
            brands: results.docs,
            pageCount: results.pages,
        }, res.statusCode));
    } catch (e) {
        logger.error(`Get Brands Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const getAllBrands = async (req, res) => {
    logger.info('Start Get All Brands - - -');
    try {
        const Brands = await Brand.find({}).lean().exec();
        return res.status(200).json(success("success", Brands, res.statusCode));
    } catch (e) {
        logger.error(`Brand Get All Error: ${e}`);
        req.flash("error_msg", e.message);
        return res.redirect("/");
    }
}

module.exports = {
    createBrand: createBrand,
    deleteBrand: deleteBrand,
    updateBrand: updateBrand,
    getBrands: getBrands,
    getAllBrands: getAllBrands
};












