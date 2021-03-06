const fs = require('fs');
const pathMiddleware = require('path');
const {ROLE_TYPES} = require('../configs/constants');
const {validation} = require('../utils/responseApi');
const data = require('../configs/languages')

const moveFile = (files, dir) => {
    const array = [];
    files.forEach((file) => {
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

const getStaticData = (selectLang) => {
    let staticData;
    if (selectLang === 'eng') {
        staticData = data[0]
    } else if (selectLang === 'arm') {
        staticData = data[1]
    }
    return staticData;
}

module.exports = {
    generateAvatar: generateAvatar,
    isAdmin: isAdmin,
    moveFile: moveFile,
    getStaticData: getStaticData,
};