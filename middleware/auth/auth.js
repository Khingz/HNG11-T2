require('dotenv').config();
const jwt = require('jsonwebtoken');

const verify_jwt = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw new CustomError('Acess Denied!, No auth header', 403);
        }
        const accessToken = req.headers.authorization.split(' ')[1].replace(/ /g, '');
        if (!accessToken) {
            throw new CustomError('Acess Denied!, No access token', 403);
        }
        // To do: Check id access token is blocked -> Logged out user token
        jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
            if (err) {
                throw new CustomError('Acess Denied!, Invalid token', 403);
            }
    
            req.userId = decoded.id;
            next();
          });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    verify_jwt
}