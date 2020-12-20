require('dotenv').config();
const express = require('express');
const app = express();
const {logger} = require('./utils/logger');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const apiRoutes = require('./routes');

require('./auth/auth');
require("./utils/mongo");

logger.info("APP START ----------");


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});