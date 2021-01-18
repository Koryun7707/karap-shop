const rimraf = require('rimraf');
const fs = require('fs');
const path = require('path');
const {logger} = require('../utils/logger');
const {validateBrand} = require('../validations/brand');
const Brand = require('../models/brands');
const {success, validation, err} = require('../utils/responseApi');
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
                        if (err) console.log(err);
                    })
                });
            }
            req.flash("error_msg",error.message );
            return res.redirect("/admin-create-brand");
            // return res.status(422).json(validation(error.message));
        }
        if (files.length !== 4) {
            files.map((file) => {
                rimraf(`./public/uploads/${file.filename}`, (err) => {
                    if (err) console.log(err);
                })
            });
            req.flash("error","Files is required.!" );
            return res.redirect("/admin-create-brand");
            // return res.status(422).json(validation('Files is required.!'));
        }
        let dir = `./public/uploads/brands`;
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) console.log(err);
            });
        }
        const brand = new Brand({
            name: value.brandName,
            info: value.brandInfo,
            type: value.brandType,
            hTag: value.brandHashTag,
            language: value.language,
        });
        brand.images = moveFile(files, dir);
        brand.save((err, result) => {
            if (err) {
                fs.readdir(dir, (error, files) => {
                    if (error) throw error;
                    for (const file of files) {
                        fs.unlink(path.join(dir, file), err => {
                            if (err) throw err;
                        });
                    }
                });
                req.flash("error_msg",err.message );
                return res.redirect("/admin-create-brand");
            }
            req.flash("success_msg","Brand add complete!" );
            return res.redirect("/admin-create-brand");
        });
    } catch (e) {
        req.flash("error",e.message );
        return res.redirect("/admin-create-brand");
        // return res.status(500).json(err(e.message, res.statusCode));
    }
};

const deleteBrand = async (req, res) => {
    logger.info('Start deleteBrand - - -');
    const {id} = req.params;
    try {
        //code must be changed, and optimized
        const brand = await Brand.findById(_id).lean();
        brand.images.map((item) => {
            rimraf(`./public/${item}`, (err) => {
                if (err) console.log(err);
            })
        });
        await Brand.findByIdAndRemove({_id: id}).lean();
        return res.status(200).json({success: true, message: 'Delete Brand Completed'});
    } catch (e) {
        logger.error(`Brand Delete Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
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
                        if (err) console.log(err);
                    })
                });
            }
            return res.status(422).json(validation(error));
        }
        if (files.length !== 4) {
            files.map((file) => {
                rimraf(`./public/uploads/${file.filename}`, (err) => {
                    if (err) console.log(err);
                })
            });
            return res.status(422).json(validation('Files is required.!'));
        }
        let dir = `./public/uploads/brands`;
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) console.log(err);
            });
        }
        brand.name = value.brandName;
        brand.info = value.brandInfo;
        brand.type = value.brandType;
        brand.hTag = value.brandHashTag;
        brand.language = value.language;
        brand.images.map((item) => {
            rimraf(`./public/${item}`, (err) => {
                if (err) console.log(err);
            })
        });
        brand.images = moveFile(files, dir);
        brand.save((err, result) => {
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

            return res.status(200).json(success('Brand Update Complete!', {
                result
            }, res.statusCode))
        });

    } catch (e) {
        logger.error(`Brand Update Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const getBrands = async (req, res, next) => {
    try {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        console.log(req.query.page);
        const page = Number(req.query.page) || 1;
        const limit = 1;
        const options = {
            page: page,
            limit: limit,
        }
        const results = await Brand.paginate({language: req.session.language}, options);
        return res.status(200).json(success('success', {
            brands: results.docs,
            pageCount: results.pages,
        }, res.statusCode));
    } catch (e) {
        console.log(e);
    }
}
const getAllBrands = async (req, res) => {
    logger.info('Start Get All Brands - - -');
    try {
        const Brands = await Brand.find({language: req.session.language}).lean().exec();
        console.log(Brands)
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