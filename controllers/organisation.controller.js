const CustomError = require("../middleware/error/customError");
const db = require("../models");


// Controller to handles getting user organisation
const getUserOrganisations = async (req, res, next) => {
    try {
        // Find only organsations the user belongs to
        const userOrg = await db.User.findByPk(req.userId, {
            include: {
                model: db.Organisation,
                as: 'organisations',
                through: {
                    attributes: []
                }
            }
        });
        // orgs array, holds user oranisations objects
        const orgs = [];
        // Map through user oranisations and add it to orgs Array
        userOrg.organisations.map(instance => {
            let orgObj = {
                orgId: instance.dataValues.orgId,
                name: instance.dataValues.name,
                description: instance.dataValues.description
            };
            orgs.push(orgObj);
        });
        res.status(200).json({
            status: 'success',
            message: 'Organisations fetch successfully',
            data: {
                organisations: orgs
            }
        })
    } catch (err) {
        next(err)
    }
}

// COntroller to get a user single organisation by id
const getSingleOrganisation = async (req, res, next) => {
    try {
        const { orgId } = req.params;
        // Find only organsations the user belongs to
        const userOrganisation = await db.Organisation.findOne({
            where: { orgId },
            include: [{
              model: db.User,
              as: 'users',
              attributes: ['userId'],
            }],
        });

        if (!userOrganisation) {
            throw new CustomError('No organisation found for the given organisation Id', 404);
        }
        // Extract orgnaisations into plain javascript object
        const plainOrg = userOrganisation.get({ plain: true });
        // Check to see if any organisation's user id matches user id of requester
        plainOrg.users.map(org => {
            if (req.userId === org.userId) {
                return res.status(200).json({
                    status: 'success',
                    message: 'Organisation fetch successfully',
                    data: {
                        orgId: plainOrg.orgId,
                        name: plainOrg.name,
                        description: plainOrg.description,
                    }
                })
            }
        })
        // User id not found, requster unauthorized to get the organisation
        res.status(403).json({
            status: 'Bad reuest',
            message: 'You are not authorized to get this organisation',
            statusCode: 403
        });
    } catch(err) {
        next(err);
    }
}


// COntoller to create new organisation
const createOrganisation = async (req, res, next) => {
    try {
        let {name, description} = req.body;
        const newOrg = await db.Organisation.create({name, description});
        if (newOrg) {
            const addUserToOrg = await db.UserOrganisations.create({
                userId: req.userId,
                orgId: newOrg.orgId
            });
            if (addUserToOrg) {
                return res.status(201).json({
                    status: 'success',
                    message: 'Organisation created successfully',
                    data: {
                        orgId: newOrg.orgId,
                        name: newOrg.name,
                        description: newOrg.description,
                    }
                })
            }
        }
        res.status(401).json({
            status: 'Bad request',
            message: 'Client error',
            statusCode: 400
        })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({
            status: 'Bad request',
            message: 'Client error',
            statusCode: 400
        })
    }
}


// Controller to add a new user to an organisation
const addUser = async (req, res, next) => {
    try {
        const { orgId } = req.params;
        const {userId} = req.body;
        if (!orgId) {
            return res.status(401).json({
                status: 'Bad request',
                message: 'No organosation id passed',
                statusCode: 401
            })
        }

        if (!userId || userId === '') {
            return res.status(401).json({
                status: 'Bad request',
                message: 'UserId cannot be null or empty',
                statusCode: 401
            })
        }
        const org = await db.Organisation.findOne({
            where: { orgId }
        });
        if (!org) {
            throw new CustomError('Client error', 400);
        }
        const user = await db.User.findOne({
            where: { userId }
        });
        if (!user) {
            throw new CustomError('Client error', 400);
        }
        const userOrg = await db.UserOrganisations.findOne({
            where: { orgId, userId }
        });
        if (userOrg) {
            throw new CustomError('Client error, user aleady belongs to this organisation', 400);
        }
        const addUserToOrg = await db.UserOrganisations.create({
            userId: userId,
            orgId: orgId
        });
        if(!addUserToOrg) {
            throw new CustomError('Server error', 500);
        }
        res.status(201).json({
            status: 'success',
            message: 'User added to organisation successfully',
        })
    } catch(err) {
        console.log(err);
        next(err)
    }
}

module.exports = {
    getUserOrganisations,
    getSingleOrganisation,
    createOrganisation,
    addUser
}