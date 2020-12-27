const Product = require('../models/product');
const {logger} = require('../utils/logger');
const {validateProduct} = require('../validations/product')
const {success, validation, err} = require('../utils/responseApi');

const createProduct = async (req, res) => {
    logger.info('Start createProduct - - -');
    try {
        const {error, value} = validateProduct(req.body);
        if (error && error.details) {
            logger.error(`Validate Error: ${error}`);
            return res.status(422).json(validation(error));
        }
        const newProduct = new Product(value);
        await newProduct.save();
        return res.status(200).json(success('Product Add Complete!', {
            newProduct
        }, res.statusCode));
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

module.exports = {
    createProduct: createProduct,
    deleteProduct: deleteProduct,
    updateProduct: updateProduct,
};