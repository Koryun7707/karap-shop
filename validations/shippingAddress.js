const {logger} = require('../utils/logger');
const Joi = require('joi');

const validateShippingAddress = (data) => {
    logger.info('Start Validate shipping address - - -')
    const schema = Joi.object().keys({
        address: Joi.string().required(),
        apartment: Joi.string().required(),
        city: Joi.string().required(),
        country: Joi.string().required(),
        phone: Joi.string().required(),
        selectedProducts: Joi.array().required(),
    });
    return schema.validate(data);
};


module.exports = {
    validateShippingAddress: validateShippingAddress,
};
