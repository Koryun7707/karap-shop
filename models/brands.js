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
    registrationAddress: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        enum: ['eng', 'arm'],
    }
});

brandSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Brand', brandSchema);