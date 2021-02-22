const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
var minuteFromNow = function(){
    var timeObject = new Date();
    timeObject.setTime(timeObject.getTime() + 1000 * 60*60);
    return timeObject;
};

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
    deliveryPrice:{
        type: String,
        required:true
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
        default: minuteFromNow
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


