const rimraf = require('rimraf');
const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const {logger} = require('../utils/logger');
const {validateProduct} = require('../validations/product')
const {success, validation, err} = require('../utils/responseApi');
const {moveFile} = require('../utils/helper');

const createProduct = async (req, res) => {
    logger.info('Start createProduct - - -');
    try {
        console.log(req.body);
        const files = req.files;
        const {error, value} = validateProduct(req.body);
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
        if (files.length !== 5) {
            files.map((file) => {
                rimraf(`./public/uploads/${file.filename}`, (err) => {
                    if (err) console.log(err);
                })
            });
            return res.status(422).json(validation('Files is required.!'));
        }
        let dir = `./public/uploads/product`;
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) console.log(err);
            });
        }
        const newProduct = new Product({
            brandId: value.brandId,
            name: value.productName,
            type: value.productType,
            price: value.productPrice,
            size: value.productSize,
            sale: value.productSale,
            color: value.productColor,
            count: value.productCount,
            language: value.language,
        });
        newProduct.images = moveFile(files, dir);
        newProduct.save((err, result) => {
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
            return res.status(200).json(success('Product Add Complete!', result, res.statusCode));
        });
    } catch (e) {
        logger.error(`Added Product Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const deleteProduct = async (req, res) => {
    logger.info('Start deleteProduct - - -');
    const params = req.params;
    try {
        await Product.findByIdAndRemove({_id: params.id}).lean();
        return res.status(200).json({success: true, message: 'Delete Product Completed'});
    } catch (error) {
        logger.error(`Product Delete Error: ${error}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const updateProduct = async (req, res) => {
    logger.info('Start updateProduct - - -');
    try {
        const _id = req.body._id;
        delete req.body._id;
        const {error, value} = validateProduct(req.body);
        if (error && error.details) {
            logger.error(`Validate Error: ${error}`);
            return res.status(422).json(validation(error));
        }
        await Product.findByIdAndUpdate({_id}, value).lean();
        return res.status(200).json(success('Product Update Complete!', {
            value
        }, res.statusCode));
    } catch (error) {
        logger.error(`Product Update Error: ${error}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const getProducts = async (req, res) => {
    logger.info('Start getProducts - - -');
    try {
        const {filterByType} = req.body;
        const data = await Product.find({type: filterByType});
        return res.status(200).json(success('Products Data!', {
            data
        }, res.statusCode));

    } catch (e) {
        logger.error(`Get Products Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const getProductsShopFilter = async (req, res) => {
    logger.info('Start getProductsShopFilter - - -')
    try {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        const page = Number(req.body.page) || 1;
        const limit = 1;
        const options = {
            page: page,
            limit: limit,
        }
        console.log(req.body,777);
        const types = req.body['types[]'] || req.body.type ||  [];
        const brandIds = req.body['brandIds[]'] || req.body.brandId || [];
        const searchValue = req.body.searchValue || '';
        let data;
        if (!brandIds.length && !types.length && searchValue === undefined) {
            data = await Product.paginate({language: req.session.language}, options);
        } else if (brandIds.length > 0 && types.length > 0) {
            const search = {
                $and: [
                    {
                        '$or': [
                            {'name': {'$regex': searchValue, "$options": "i"}},
                        ]
                    }
                    , {language: req.session.language}
                    , {
                        type: {"$in": types}
                        , brandId: {"$in": brandIds}
                    }
                ]
            };
            data = await Product.paginate(search, options);
            // await Product.find(search).select('images name');
        } else if (brandIds.length > 0) {
            const search = {
                $and: [
                    {
                        '$or': [
                            {'name': {'$regex': searchValue, "$options": "i"}},
                        ]
                    }
                    , {language: req.session.language}
                    , {brandId: {"$in": brandIds}},
                ]
            };
            data = await Product.paginate(search, options);

        } else if (types.length > 0) {
            const search = {
                $and: [
                    {
                        '$or': [
                            {'name': {'$regex': searchValue, "$options": "i"}},
                        ]
                    }
                    , {language: req.session.language}
                    , {type: {"$in": types}},
                ]
            };
            data = await Product.paginate(search, options);

        } else {
            const search = {
                $and: [
                    {
                        '$or': [
                            {'name': {'$regex': searchValue, "$options": "i"}},
                        ]
                    }
                    , {language: req.session.language},
                ]
            };
            data = await Product.paginate(search, options);
        }
        return res.status(200).json(success('Products Data Shop!', {
            data: data.docs,
            pageCount: data.pages,
        }, res.statusCode));

    } catch (e) {
        logger.error(`Get Products Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }

}

module.exports = {
    createProduct: createProduct,
    deleteProduct: deleteProduct,
    updateProduct: updateProduct,
    getProducts: getProducts,
    getProductsShopFilter: getProductsShopFilter,
};