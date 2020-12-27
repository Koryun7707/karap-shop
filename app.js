require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {logger} = require('./utils/logger');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const apiRoutes = require('./routes');

mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('Connected to database');
});

require('./auth/auth');

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

app.use('/', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});