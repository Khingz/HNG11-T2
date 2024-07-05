const CustomError = require('./customError');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({ error: err.message });
    } else {
        console.log(err)
        res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
    }
}

module.exports = errorHandler;