const {logger} = require('../utils/logger');
const Joi = require('joi');

const validateBrand = (data) => {
    logger.info('Start Validate Brand - - -')
    const schema = Joi.object().keys({
        brandName: Joi.string().required(),
        registrationAddress: Joi.string().required(),
        brandInfo: Joi.string().required(),
        brandInfoArm: Joi.string().required(),
        brandType: Joi.string().allow('', null),
        brandTypeArm: Joi.string().allow('', null),
    });
    return schema.validate(data);
};

module.exports = {
    validateBrand: validateBrand,
};