module.exports = {
    checkIsAuthenticated: function (req, res, next) {
        console.log('isAuthenticated', req.isAuthenticated())
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.render('index', {URL: '/', user: null});
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
};
