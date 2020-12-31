const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const roleTypes = require('../configs/constants').ROLE_TYPES;
const bcrypt = require('bcrypt');
const saltRounds = 10;


const userSchema = new Schema({
    _id: {
        type: ObjectId,
        auto: true
    },
    roleType: {
        type: String,
        enum: [roleTypes.ADMIN, roleTypes.USER],
    },
    firstName: {
        type: String,
        minLength: 2,
        maxLength: 256,
        required: true,
    },
    lastName: {
        type: String,
        minLength: 2,
        maxLength: 256,
        required: true,
    },
    email: {
        type: String,
        minLength: 2,
        maxLength: 256,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

//have a bcrypt error must be resolve
// userSchema.pre('save', async function (next) {
//     this.password = await bcrypt.hash(this.password, saltRounds);
//     next();
// });

userSchema.methods.comparePassword = function (password) {
    return password === this.password;
    // return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.password;
    return obj;
};

userSchema.set('toObject', {virtuals: true});
userSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('User', userSchema);