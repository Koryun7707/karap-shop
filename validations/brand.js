const {logger} = require('../utils/logger');
const Joi = require('joi');

const validateBrand = (data) => {
    logger.info('Start Validate Brand - - -')
    const schema = Joi.object().keys({
        brandName: Joi.string().required(),
        registrationAddress: Joi.string().required(),
        brandInfo: Joi.string().required(),
        brandType: Joi.string().allow('', null),
        brandHashTag: Joi.string().allow('', null),
        language: Joi.string().required(),
    });
    return schema.validate(data);
};

module.exports = {
    validateBrand: validateBrand,
};