require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {logger} = require('./utils/logger');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const apiRoutes = require('./routes');

require('./auth/auth');

mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('Connected to database');
});


app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static("./public"))//href="./public/css/style.css"
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use('/api', apiRoutes);

logger.info("APP START ----------");

app.get('/', (req, res) => {
    res.render('index', {URL: '/'});
});
app.get('/about', (req, res) => {
    res.render('aboutUs', {URL: '/about'});
});
app.get('/blog', (req, res) => {
    res.render('blog', {URL: '/blog'});
});
app.get('/brand', (req, res) => {
    res.render('brand', {URL: '/brand'});
});
app.get('/contact', (req, res) => {
    res.render('contactUs', {URL: '/contact'});
});

app.get('/join-our-team', (req, res) => {
    res.render('joinOurTeam', {URL: '/join-our-team'});
});

app.get('/shop', (req, res) => {
    res.render('shop', {URL: '/shop'});
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});