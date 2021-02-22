const {logger} = require('../utils/logger');
const Joi = require('joi');

const validateProduct = (data) => {
    logger.info('Start Validate Product - - -')
    const schema = Joi.object().keys({
        brandId: Joi.string().required(),
        productName: Joi.string().required(),
        productNameArm: Joi.string().required(),
        productType: Joi.string().required(),
        productTypeArm: Joi.string().required(),
        productPrice: Joi.number().required(),
        productSize: Joi.string().allow('', null),
        productSale: Joi.string().allow('', null),
        productDescription: Joi.string().allow('', null),
        productDescriptionArm: Joi.string().allow('', null),
        productColor: Joi.string().allow('', null),
        productPak3: Joi.string().allow('', null),
        productPak6: Joi.string().allow('', null),
        productCount: Joi.string().required(),
        productWeight: Joi.string().required(),
    });
    return schema.validate(data);
};


module.exports = {
    validateProduct: validateProduct,
};

