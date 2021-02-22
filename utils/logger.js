const winston = require('winston');

const logConfiguration = {
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            level: 'error',
            filename: 'logs/errors.log'
        })
    ],
    format: winston.format.combine(
        winston.format.printf(info => `${info.message}`),
    )
};

const logger = winston.createLogger(logConfiguration);

module.exports = {
    logger
}
