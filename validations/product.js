const {logger} = require('../utils/logger');
const Joi = require('joi');

const validateProduct = (data) => {
    logger.info('Start Validate Product - - -')
    const schema = Joi.object().keys({
        brandId: Joi.string().required(),
        productName: Joi.string().required(),
        productType: Joi.string().required(),
        productPrice: Joi.string().required(),
        productSize: Joi.string().allow('', null),
        productSale: Joi.string().allow('', null),
        productColor: Joi.string().allow('', null),
        productCount: Joi.string().required(),
        language: Joi.string().required(),
    });
    return schema.validate(data);
};


module.exports = {
    validateProduct: validateProduct,
};
