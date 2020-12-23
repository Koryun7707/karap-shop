const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const productSchema = new Schema({
    _id: {
        type: ObjectId,
        auto: true
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
        type: Number,
        required: true
    },
    size: {
        type: Number,
    },
    color: {
        type: String,
    },
    sale: {
        type: Number,
    },
    count: {
        type: Number,
        required: true,
    },
    images: {
        type: Array,
        required: true,
    }
});

module.exports = mongoose.model('Product', productSchema);