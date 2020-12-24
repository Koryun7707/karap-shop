const {logger} = require('../utils/logger');
const Joi = require('joi');


const validateBrand = (data) => {
    logger.info('Start Validate Brand - - -')
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        info: Joi.string().required(),
        type: Joi.string().allow('', null),
        hTag: Joi.string().allow('', null),
        logo: Joi.string().required(),
        image: Joi.string().required(),
    });
    return schema.validate(data);
};
const validateProduct = (data) => {
    logger.info('Start Validate Product - - -')
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        brandId: Joi.string(),
        type: Joi.string().required(),
        price: Joi.number().required(),
        size: Joi.number().allow('', null),
        sale: Joi.number().allow('', null),
        color: Joi.string().allow('', null),
        count: Joi.number().required(),
        images: Joi.array(),
    });
    return schema.validate(data);
};


module.exports = {
    validateBrand: validateBrand,
    validateProduct: validateProduct
};
