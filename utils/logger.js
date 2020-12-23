const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')


const createLogger = transports => winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.simple(),
    ),
    transports
})

const logger = createLogger([
    new (DailyRotateFile)({
        filename: `./logs/combined-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
    }),
    new winston.transports.Console({
        log: ({message}, next) => {
            console.log(message)
            next()
        }
    })
])

const noteLogger = createLogger([
    new (DailyRotateFile)({
        frequency: '1d',
        filename: `./logs/note-logs-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
    })
])

const templateLogger = createLogger([
    new winston.transports.File({filename: './logs/templates.log'})
])

const poolAlertLogger = createLogger([
    new winston.transports.File({filename: './logs/poolAlerts.log'})
])

const logStats = createLogger([
    new winston.transports.File({filename: './logs/logStats.log'})
])

/**
 * @example // Usage example
 * const logger = new LogsQueue()
 * logger.error('some error')
 * logger.info('some info')
 * logger.warn('some warn')
 * logger.error('some other error')
 * logger.exec() // immediately log all above logs with the order they were added to logs queue
 */
function LogsQueue() {
    let timer
    const logs = []

    /**
     * @param {String} log
     * @param {Boolean} exec if `true` this.exec() will be called (`true` by default)
     */
    this.error = (log, exec = true) => {
        logs.push({key: 'error', log})
        if (exec) this.exec()
        else resetTimer()
    }
    this.warn = log => {
        resetTimer()
        logs.push({key: 'warn', log})
    }
    this.info = log => {
        resetTimer()
        logs.push({key: 'info', log})
    }
    this.exec = () => {
        if (timer) clearTimeout(timer)
        for (const {key, log} of logs) logger[key](log)
        logs.splice(0)
    }

    const resetTimer = () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            logs.push({
                key: 'warn', log: `********** WARNING: last ${logs.length} logs were added to LogsQueue 30 seconds ago.
        There may be a function which execution takes longer than 30 seconds or you may forgot to call LogsQueue.exec()`
            })
            this.exec()
        }, 30 * 1000)
    }
}


module.exports = {
    logger,
    noteLogger,
    templateLogger,
    poolAlertLogger,
    logStats,
}
