require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../models');
const CustomError = require('../middleware/error/customError');
const jwt = require('jsonwebtoken');


const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            throw new CustomError('Athentication failed', 401);
        }
        const user = await db.User.findOne({
            where: {
              email: email
            },
        });
        if (!user) {
            throw new CustomError('Athentication failed', 401);
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            throw new CustomError('Athentication failed', 401);
        }
        const accessToken = jwt.sign({id: user.userId}, process.env.JWT_ACCESS_SECRET, {expiresIn: '5d'});
        res.status(201).json({
            status: 'success',
            message: 'Login successful',
            data: {
                accessToken,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone
                }
            }
        })
    } catch (err) {
        next(err);
    }
}

const register = async (req, res, next) => {
    try {
        let {firstName, password, lastName, email, phone} = req.body;
        const userExist = await db.User.findOne({
            where: {
              email: email
            },
        });
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
            const newOrgObj = {
                name: `${newUser.firstName}'s Organisation`
            }
            const newOrg = await db.Organisation.create(newOrgObj);
            if (!newOrg) {
                throw new CustomError('Error creating user organisation', 400);
            }
            const addUserToOrg = await db.UserOrganisations.create({
                userId: newUser.userId,
                orgId: newOrg.orgId
            })
            if (addUserToOrg) {
                const accessToken = jwt.sign({id: newUser.UserId}, process.env.JWT_ACCESS_SECRET, {expiresIn: '5d'});
                return res.status(201).json({
                    status: 'success',
                    message: 'Registration successful',
                    data: {
                        accessToken,
                        user: {
                            userId: newUser.userId,
                            firstName: newUser.firstName,
                            lastName: newUser.lastName,
                            email: newUser.email,
                            phone: newUser.phone
                        }
                    }
                })
            }
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
        next(err);
    }
}

module.exports = {
    login,
    register
}