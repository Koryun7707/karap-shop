const generateAvatar = (firstName, lastName) => {
    return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff`
};


module.exports = {
    generateAvatar: generateAvatar,
};