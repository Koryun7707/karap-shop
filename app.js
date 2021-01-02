require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {logger} = require('./utils/logger');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const apiRoutes = require('./routes');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')

logger.info('Start app - - - ');

mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('Connected to database');
});

// Passport Config
require('./auth/passport')(passport);

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static("./public"))//href="./public/css/style.css"


// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.post('/getJson', function (req, res) {
    console.log(888888, req.body);
});
app.use('/', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});