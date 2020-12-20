const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const apiRoutes = require('./routes');
const {DB_URL} = require('./configs/db');

require('./auth/auth');

mongoose.connect(DB_URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useCreateIndex: true,
   useFindAndModify: false,
}, () => {
   console.log('Database connected.');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', apiRoutes);

app.listen(PORT, () => {
   console.log(`Server is running on PORT: ${PORT}`);
});