const mongoose = require('mongoose');
const {logger} = require('./logger');
require('dotenv').config();


const options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology:true
};


mongoose.connect(process.env.DB_URL, options, function (err) {
    logger.info(`mongoose trying to connect to mongodb : ${process.env.DB_URL}`);
    if (err) {
        logger.error(`mongoose connection error : ${err}`);
        throw err;
    } else {
        logger.info('success');
    }
});


exports.disconnect = () => {
    mongoose.disconnect()
        .then(() => {
            logger.info('Mongoose server has disconnected!!!');
        })
        .catch(error => {
            logger.error(`Mongoose disconnecting from server failed ${error}`);
        })
}