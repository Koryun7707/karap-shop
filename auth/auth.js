module.exports = {
    checkIsAuthenticated: function (req, res, next) {
        console.log('isAuthenticated', req.isAuthenticated())
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
};
