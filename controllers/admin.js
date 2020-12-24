const Brand = require('../models/brands');
const Product = require('../models/product');
const {logger} = require('../utils/logger');
const {validateBrand, validateProduct} = require('../validations/admin')
const {success, validation, err} = require('../utils/responseApi');


const addBrand = async (req, res) => {
    logger.info('Start addBrand - - -');
    try {
        const {error, value} = validateBrand(req.body);
        if (error && error.details) {
            logger.error(`Validate Error: ${error}`);
            return res.status(422).json(validation(error));
        }
        const newBrand = new Brand(value);
        await newBrand.save();
        return res.status(200).json(success('Brand Add Complete!', {
            newBrand
        }, res.statusCode));
    } catch (e) {
        logger.error(`Added Brand error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
};
const deleteBrand = async (req,res) =>{
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
    } catch(error) {
        logger.error(`Brand Update Error: ${error}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}
const addProduct = async (req,res) =>{
    logger.info('Start addProduct - - -');
    try{
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
    } catch(e){
        logger.error(`Added Product Error: ${e}`);
        return res.status(500).json(err(e.message,res.statusCode));
    }
}
const deleteProduct = async (req,res) => {
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
const updateProduct = async (req,res) => {
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
    } catch(error) {
        logger.error(`Product Update Error: ${error}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}
module.exports = {
    addBrand: addBrand,
    deleteBrand: deleteBrand,
    updateBrand:updateBrand,
    addProduct: addProduct,
    deleteProduct: deleteProduct,
    updateProduct: updateProduct,
};