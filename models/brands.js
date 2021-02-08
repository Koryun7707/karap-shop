const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;


const brandSchema = new Schema({
    _id: {
        type: ObjectId,
        auto: true
    },
    name: {
        type: String,
        required: true,
    },
    info: {
        type: String,
        required: true,
    },
    infoArm: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    typeArm: {
        type: String,
        required: true,
    },
    images: {
        type: Array,
        required: true,
    },
    registrationAddress: {
        type: String,
        required: true,
    },
});

brandSchema.plugin(mongoosePaginate);

brandSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'brandId',
});

brandSchema.set('toObject', {virtuals: true});
brandSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('Brand', brandSchema);