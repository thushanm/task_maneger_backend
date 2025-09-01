const pinoHttp = require('pino-http');
const pino = require('pino');

const logger = pinoHttp({
    logger: pino({
        level: process.env.LOG_LEVEL || 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                ignore: 'pid,hostname',
            },
        },
    }),
    customSuccessMessage: function (req, res) {
        if (res.statusCode === 404) {
            return 'Resource not found';
        }
        return `${req.method} ${req.url} completed`;
    },
    customErrorMessage: function (req, res, err) {
        return `${req.method} ${req.url} errored with status code ${res.statusCode}`;
    },
});

module.exports = logger;
