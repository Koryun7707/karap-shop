const {ROLE_TYPES} = require('../configs/constants');
const {validation} = require('../utils/responseApi');

const isAdmin = (req, res, next) => {
    if (req.user.roleType === ROLE_TYPES.ADMIN) {
        next();
    } else {
        return res.status(422).json(validation('Access denied.'));
    }
};

const generateAvatar = (firstName, lastName) => {
    return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff`
};


module.exports = {
    generateAvatar: generateAvatar,
    isAdmin: isAdmin,
};