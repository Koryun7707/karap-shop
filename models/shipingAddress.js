const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const shippingAddressSchema = new Schema({
    _id: {
        type: ObjectId,
        auto: true
    },
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    apartment: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    productIds: {
        type: Array,
        required: true,
    },
    status:{
        type:Boolean,
        default:false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

shippingAddressSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.password;
    return obj;
};

shippingAddressSchema.set('toObject', {virtuals: true});
shippingAddressSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('ShippingAddress', shippingAddressSchema);
