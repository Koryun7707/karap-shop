const fs = require('fs');
const pathMiddleware = require('path');
const {ROLE_TYPES} = require('../configs/constants');
const {validation} = require('../utils/responseApi');

const moveFile = (files, dir) => {
    const array = [];
    files.map((file) => {
        array.push(`${dir.slice(9, dir.length)}/${file.filename}`);
        let f = pathMiddleware.basename(file.path);
        let dest = pathMiddleware.resolve(dir, f);
        fs.rename(file.path, dest, (err) => {
            if (err) {
                console.log(err);
            }
        });
    })
    return array;
};

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
    moveFile: moveFile,
};