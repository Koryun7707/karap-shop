const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const productSchema = new Schema({
    _id: {
        type: ObjectId,
        auto: true
    },
    brandId: {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
    },
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true
    },
    size: {
        type: String,
    },
    color: {
        type: String,
    },
    sale: {
        type: String,
    },
    count: {
        type: String,
        required: true,
    },
    images: {
        type: Array,
        required: true,
    },
    language: {
        type: String,
        enum: ['eng', 'ru', 'spain'],
    },
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);