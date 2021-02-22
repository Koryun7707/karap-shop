const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;


const BlogSchema = new Schema({
    _id: {
        type: ObjectId,
        auto: true
    },
    language: {//home page data in model
        type: String,
        enum: ['eng', 'arm'],
        required: true,
    },
    blogImages: {
        type: Array,
        required: true,
    },
    infoBlog:{
        type:String,
    },
    textBlogTitle:{
        type:String,
    },
    title1:{
        type:String,
    },
    title2:{
        type:String,
    }

});


module.exports = mongoose.model('Blog', BlogSchema);