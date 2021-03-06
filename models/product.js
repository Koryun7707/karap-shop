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
        type: ObjectId,
        ref: 'Brand',
        // type: mongoose.Schema.Types.ObjectId,
    },
    brandName: {
        type: String,
    },
    type: {
        type: String,
        required: true,
    },
    typeArm: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    nameArm: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    sizes: {
        type: Array,
    },
    colors: {
        type: Array,
    },
    sale: {
        type: String,
    },
    description: {
        type: String,
    },
    descriptionArm: {
        type: String,
    },
    productWeight: {
        type: String,
        required: true,
    },
    count: {
        type: String,
        required: true,
    },
    images: {
        type: Array,
        required: true,
    },
    productPak3: {
        type: String,
    },
    productPak6: {
        type: String,
    },
    complect: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }

});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);


