const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;


const pageDataSchema = new Schema({
    _id: {
        type: ObjectId,
        auto: true
    },
    language: {//home page data in model
        type: String,
        enum: ['eng', 'ru', 'spain'],
        required: true,
    },
    homeSliderText: {
        type: String,
    },
    homeSliderImages: {
        type: Array,
        required: true,
    },
    homeProductTypeTitle: {
        type: String,
    },
    textShopSlider: {//shop page data
        type: String,
    },
    imagesShopSlider: {
        type: Array,
        required: true,
    },//brand data
    textBrandSlider: {//shop page data
        type: String,
    },
    imagesBrandSlider: {
        type: Array,
        required: true,
    },
    textAboutSlider: {//About page
        type: String,
    },
    imagesAboutSlider: {
        type: Array,
        required: true,
    },
    ourPhilosophy: {
        type: String,
    },
    textContactSlider: {//Contact us page
        type: String,
    },
    imagesContactSlider: {
        type: Array,
        required: true,
    },
    textJoinOurTeamSlider: {//join-our-team
        type: String,
    },
    imagesJoinOurTeamSlider: {
        type: Array,
        required: true,
    },
    joinOurTeamWorkUs: {
        type: String,
    },
    joinOurCol1Title: {
        type: String,
    },
    joinOurCol1Text: {
        type: String,
    },
    joinOurCol2Title: {
        type: String,
    },
    joinOurCol2Text: {
        type: String,
    },
    joinOurCol3Title: {
        type: String,
    },
    joinOurCol3Text: {
        type: String,
    },
    joinOurTeamPartners: {
        type: String,
    },
    joinOurTeamPartnersTitle: {
        type: String,
    }
});


module.exports = mongoose.model('PageData', pageDataSchema);