const CustomError = require("./customError");

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({error: [{
            status: 'Bad reuest',
            message: err.message,
            statusCode: err.statusCode
        }]});
    } else {
        console.log(err)
        return res.status(err.statusCode).json({error: [{
            status: 'Server Error',
            message: err.message || 'Internal Server Error',
            statusCode: err.statusCode
        }]});
    }
}

module.exports = errorHandler;