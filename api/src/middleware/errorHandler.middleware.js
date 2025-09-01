const { BaseError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    req.log.error(err, 'An error occurred');

    if (err instanceof BaseError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    // Handle unexpected errors
    return res.status(500).json({
        status: 'error',
        message: 'An internal server error occurred.',
    });
};

module.exports = errorHandler;
