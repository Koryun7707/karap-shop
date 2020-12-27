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

module.exports = {
    validateBrand: validateBrand,
};