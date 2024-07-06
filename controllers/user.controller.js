const CustomError = require("../middleware/error/customError");
const db = require("../models")


// COntroller that gets a user if the user shares any organisation with the requester
const getUser = async (req, res, next) => {
    try {
        const { id: targetUserId } = req.params;
        // Find requester and their organisations
        const loggedInUser = await db.User.findByPk(req.userId, {
            include: {
                model: db.Organisation,
                as: 'organisations',
                through: {
                    attributes: []
                }
            }
        });
        if (req.userId === targetUserId) {
            return res.status(200).json({
                status: 'success',
                message: 'User fetch successfully',
                data: {
                    user: {
                        userId: loggedInUser.userId,
                        firstName: loggedInUser.firstName,
                        lastName: loggedInUser.lastName,
                        email: loggedInUser.email,
                        phone: loggedInUser.phone
                    }
                }
            })
        }
        if (!loggedInUser.organisations) {
            throw new CustomError('You cannot access this user', 403);
        }
        // Find the user and their organisation
        const targetUser = await db.User.findByPk(targetUserId, {
            include: {
                model: db.Organisation,
                as: 'organisations',
                through: {
                    attributes: []
              }
            }
        });
        if (!targetUser) {
            throw new CustomError('User not found', 404);
        }
        if (!targetUser.organisations) {
            throw new CustomError('You cannot access this user', 403);
        }
        // Check if user and requester share any organisation in common
        const commonOrg = loggedInUser.organisations.filter(org1 =>
            targetUser.organisations.some(org2 => org1.id === org2.id)
        );
        // Throw error is no organisation is found in common
        if (commonOrg.length > 0) {
            throw new CustomError('You cannot access this user', 403);
        }
        res.status(200).json({
            status: 'success',
            message: 'User fetch successfully',
            data: {
                user: {
                    userId: targetUser.userId,
                    firstName: targetUser.firstName,
                    lastName: targetUser.lastName,
                    email: targetUser.email,
                    phone: targetUser.phone
                }
            }
        })
    } catch (err) {
        next(err);
    }
}


module.exports = {
    getUser
}