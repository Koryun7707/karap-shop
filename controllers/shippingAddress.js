const ShippingAddress = require('../models/shipingAddress');
const {logger} = require('../utils/logger');
const {success, validation, err} = require('../utils/responseApi');
const {validateShippingAddress} = require('../validations/shippingAddress');

const createShippingAddress = async (req, res) => {
    //TODO must be work sended data after success payed
    //TODO give data from loocal storage
    // TODO from body must be come selected product array, and user shipping address data
    console.log(req.body);
    logger.info('Start create shipping address - - -');
    try {
        const {error, value} = validateShippingAddress(req.body);
        if (error) {
            throw error;
        }
        const newShippingAddress = new ShippingAddress({
            userId: req.session.userId,
            address: value.address,
            apartment: value.apartment,
            city: value.city,
            country: value.country,
            phone: value.phone,
            productIds: value.selectedProducts,
        });
        await newShippingAddress.save();
    } catch (error) {
        logger.error(`createShippingAddress Error: ${error}`);
        return res.status(500).json(err(error.message, res.statusCode));
    }
}

const getShippingAddresses = async (req, res) => {
    logger.info('Start get shipping addresses - - -');
    try {
        const getShippingAddresses = await ShippingAddress.find({date: -1,});
        if (!getShippingAddresses) {
            return res.status(500).json(err('Shipping model is empty', res.statusCode));
        }
        return res.status(200).json(success('success', getShippingAddresses, res.statusCode));
    } catch (error) {
        logger.error(`createShippingAddress Error: ${error}`);
        return res.status(500).json(err(error.message, res.statusCode));
    }
}
module.exports = {
    createShippingAddress: createShippingAddress,
    getShippingAddresses: getShippingAddresses,
};