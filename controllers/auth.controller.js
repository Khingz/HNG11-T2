require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../models');
const CustomError = require('../middleware/error/customError');
const jwt = require('jsonwebtoken');


// Login Controller for Login route
const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            res.status(401).json({
                "status": "Bad request",
                "message": "Authentication failed",
                "statusCode": 401
            })
        }
        const user = await db.User.findOne({
            where: {
              email: email
            },
        });
        if (!user) {
            res.status(401).json({
                "status": "Bad request",
                "message": "Authentication failed",
                "statusCode": 401
            })
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            res.status(401).json({
                "status": "Bad request",
                "message": "Authentication failed",
                "statusCode": 401
            })
        }
        const accessToken = await jwt.sign({id: user.userId}, process.env.JWT_ACCESS_SECRET, {expiresIn: '5d'});
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
        console.log(err);
        next(err);
    }
}

// Register controller for register route
const register = async (req, res, next) => {
    try {
        let {firstName, password, lastName, email, phone} = req.body;
        // Create a user instance with the input data
        const newUserData = db.User.build({
            firstName,
            lastName,
            email,
            phone,
            password
        });
        // Validate the user instance
        await newUserData.validate();
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
        newUserData.password = hashedPassword;
        // Save the new user to the database
        const newUser = await newUserData.save();
        if (newUser) {
            const newOrgObj = {
                name: `${newUser.firstName}'s Organisation`
            }
            // Create a default organisation for the new user
            const newOrg = await db.Organisation.create(newOrgObj);
            if (!newOrg) {
                throw new CustomError('Error creating user organisation', 400);
            }
            // Add the new user to the newly created organisation
            const addUserToOrg = await db.UserOrganisations.create({
                userId: newUser.userId,
                orgId: newOrg.orgId
            })
            if (addUserToOrg) {
                // Generate access token for auto login after user registration
                const accessToken = jwt.sign({id: newUser.userId}, process.env.JWT_ACCESS_SECRET, {expiresIn: '5d'});
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
        // Something bad happen in the entire process
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