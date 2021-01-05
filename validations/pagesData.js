const {logger} = require('../utils/logger');
const Joi = require('joi');

const validateHomeData = (data) => {
    logger.info('Start Validate Home page data - - -')
    const schema = Joi.object().keys({
        textOnHomeSlider: Joi.string().allow(''),
        homeProductTypeTitle: Joi.string().allow(''),
        language: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateShopData = (data) => {
    logger.info('Start Validate Home page data - - -')
    const schema = Joi.object().keys({
        textShopSlider: Joi.string().allow(''),
        imagesShopSlider: Joi.string().allow(''),
        language: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateBrandData = (data) => {
    logger.info('Start Validate Home page data - - -')
    const schema = Joi.object().keys({
        textBrandSlider: Joi.string().allow(''),
        imagesBrandSlider: Joi.string().allow(''),
        language: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateAboutData = (data) => {
    logger.info('Start Validate Home page data - - -')
    const schema = Joi.object().keys({
        textAboutSlider: Joi.string().allow(''),
        imagesAboutSlider: Joi.string().allow(''),
        titleOfSlider: Joi.string().required(),
        ourPhilosophy: Joi.string().required(),
        titleOurPhilosophy: Joi.string().required(),
        language: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateContactData = (data) => {
    logger.info('Start Validate Home page data - - -')
    const schema = Joi.object().keys({
        textContactSlider: Joi.string().allow(''),
        imagesContactSlider: Joi.string().allow(''),
        language: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateJoinOurTeamData = (data) => {
    logger.info('Start Validate join our team page data - - -')
    const schema = Joi.object().keys({
        textJoinOurTeamSlider: Joi.string().allow(''),
        joinOurTeamWorkUs: Joi.string().required(),
        joinOurCol1Title: Joi.string().required(),
        joinOurCol1Text: Joi.string().required(),
        joinOurCol2Title: Joi.string().required(),
        joinOurCol2Text: Joi.string().required(),
        joinOurCol3Title: Joi.string().required(),
        joinOurCol3Text: Joi.string().required(),
        joinOurTeamPartners: Joi.string().required(),
        joinOurTeamPartnersTitle: Joi.string().required(),
        language: Joi.string().required(),
    });
    return schema.validate(data);
};


module.exports = {
    validateHomeData: validateHomeData,
    validateShopData: validateShopData,
    validateBrandData: validateBrandData,
    validateAboutData: validateAboutData,
    validateContactData: validateContactData,
    validateJoinOurTeamData: validateJoinOurTeamData
};