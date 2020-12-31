const mongoose = require('mongoose');
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
    type: {
        type: String,
        required: true,
    },
    hTag: {
        type: String,
        required: true,
    },
    logo: {
        type: Array,
        required: true,
    },
    brandImages: {
        type: Array,
        required: true,
    }
});


module.exports = mongoose.model('Brand', brandSchema);