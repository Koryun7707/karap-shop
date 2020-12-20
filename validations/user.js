const Joi = require('joi');

const validateUser = (data) => {
    const schema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string()
            .required()
            .min(8)
            .max(20),
        confirmPassword: Joi.string().min(1).required(),
    });
    return schema.validate(data);
};

module.exports = {
    validateUser: validateUser,
};
