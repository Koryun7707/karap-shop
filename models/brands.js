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
        type:String,
        required:true,
    },
    type: {
        type: String,
    },
    hTag: {
        type: String,
    },
    logo: {
        type: String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    }
});



module.exports = mongoose.model('Brand', brandSchema);