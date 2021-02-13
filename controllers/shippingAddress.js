const ShippingAddress = require('../models/shipingAddress');
const {logger} = require('../utils/logger');
const {success, err} = require('../utils/responseApi');
const {validateShippingAddress} = require('../validations/shippingAddress');
const {getStaticData} = require('../utils/helper');
const User = require('../models/user')

const createShippingAddress = async (req, res) => {
    //TODO must be work sended data after success payed
    //TODO give data from loocal storage
    // TODO from body must be come selected product array, and user shipping address data
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
        var perPage = 20
        var page = req.query.page || 1
        const staticData = await getStaticData(req.session.language);
         ShippingAddress.find({})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate({
            path: 'userId',
            select: 'firstName lastName email -_id',
        }).exec(function(err, shippingAddress) {
             ShippingAddress.count().exec(function (err, count) {
                    if (err) return logger.error(`${err}`);
                    res.render('admin/shippingAddressUsers', {
                        shippingAddress: shippingAddress,
                        current: page,
                        pages: Math.ceil(count / perPage),
                        URL: '/shipping-address',
                        user: req.session.user,
                        staticData: staticData,
                    })
                });
            })
    } catch (e) {
        logger.error(`Get Shipping Address Error: ${e}`);
        req.flash('error_msg', e.message);
        return res.redirect('/');
    }
}
const deleteOrder = async(req,res)=>{
    logger.info('Start deleteOrder - - -');
    const {id} = req.params;
    try {
        await ShippingAddress.findByIdAndRemove({_id: id}).lean();
        return res.status(200).json({success: true, message: 'Delete Order Completed'});
    } catch (e) {
        logger.error(`Order Delete Error: ${e}`);
        req.flash("error", e.message);
        return res.redirect("/shipping-address");
    }
}
module.exports = {
    createShippingAddress: createShippingAddress,
    getShippingAddresses: getShippingAddresses,
    deleteOrder:deleteOrder
};
