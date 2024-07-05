require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../models');

const login = async (req, res, next) => {
    return res.json({msg: 'LoggedIn'});
}

const register = async (req, res, next) => {
    try {
        let {firstName, password, lastName, email, phone} = req.body;
        const userExist = await db.User.findOne({
            where: {
              email: email
            },
        })
        if (userExist) {
            throw new CustomError('Email already in use', 409);
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUserObj = {
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword
        }
        const newUser = await db.User.create(newUserObj);
        if (newUser) {
            return res.status(201).json({
                status: 'success',
                message: 'Registration successful',
                data: {
                    accessToken: 'Pending',
                    user: {
                        userId: newUser.userId,
                        firstname: newUser.firstname,
                        lastname: newUser.lastname,
                        email: newUser.email,
                        phone: newUser.phone
                    }
                }
            })
        }
        res.status(400).json({
            status: 'Bad request',
            message: 'Registration unsuccessful',
            statusCode: 400
        })
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const errArr = []
            err.errors.map(e => {
                let newErrObj = {
                    field: e.instance.constructor.name,
                    message: e.message
                }
                errArr.push(newErrObj);
            });
            res.status(422).json({ errors: errArr });
        }
        console.log(err);
        next(err);
    }
}

module.exports = {
    login,
    register
}