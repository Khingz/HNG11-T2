require('dotenv').config();
const jwt = require('jsonwebtoken');
const CustomError = require('../error/customError');


// Helper function to promisify jwt.verify callback method
function verifyToken(accessToken, secret) {
    return new Promise((resolve, reject) => {
        jwt.verify(accessToken, secret, (err, decoded) => {
            if (err) {
                return reject(new CustomError('Access Denied! Invalid token', 401));
            }
            resolve(decoded);
        });
    });
}

// Hanldes verifying jwt passed via request header
const verify_jwt = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw new CustomError('Acess Denied!, No auth header', 401);
        }
        const accessToken = req.headers.authorization.split(' ')[1].replace(/ /g, '');
        if (!accessToken) {
            throw new CustomError('Acess Denied!, No access token', 401);
        }
        // To do: Check id access token is blocked -> Logged out user token
        const decoded = await verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    verify_jwt,
    verifyToken
}