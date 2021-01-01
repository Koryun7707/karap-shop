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
    images: {
        type: Array,
        required: true,
    },
    language: {
        type: String,
        enum: ['eng', 'ru', 'spain'],
    }
});


module.exports = mongoose.model('Brand', brandSchema);