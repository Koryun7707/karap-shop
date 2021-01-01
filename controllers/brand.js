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
            return res.status(422).json(validation(error.message));
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
                return res.status(422).json(validation(err.message));
            }
            return res.status(200).json(success('Brand add complete!', result, res.statusCode));
        });
    } catch (e) {
        return res.status(500).json(err(e.message, res.statusCode));
    }
};

const deleteBrand = async (req, res) => {
    logger.info('Start deleteBrand - - -');
    const params = req.params;
    try {
        await Brand.findByIdAndRemove({_id: params.id}).lean();
        return res.status(200).json({success: true, message: 'Delete User Completed'});
    } catch (error) {
        logger.error(`Brand Delete Error: ${error}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const updateBrand = async (req, res) => {
    logger.info('Start Brand update - - -');
    try {
        const _id = req.body._id;
        delete req.body._id;
        const {error, value} = validateBrand(req.body);
        if (error && error.details) {
            logger.error(`Validate Error: ${error}`);
            return res.status(422).json(validation(error));
        }
        await Brand.findByIdAndUpdate({_id}, value).lean();
        return res.status(200).json(success('Brand Update Complete!', {
            value
        }, res.statusCode));
    } catch (error) {
        logger.error(`Brand Update Error: ${error}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

module.exports = {
    createBrand: createBrand,
    deleteBrand: deleteBrand,
    updateBrand: updateBrand,
};