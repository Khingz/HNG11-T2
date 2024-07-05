const CustomError = require("../middleware/error/customError");
const db = require("../models")

const getUser = async (req, res, next) => {
    try {
        const { id: targetUserId } = req.params;
        const loggedInUser = await db.User.findByPk(req.userId, {
            include: {
                model: db.Organisation,
                as: 'organisations',
                through: {
                    attributes: []
                }
            }
        });
        if (!loggedInUser.organisations) {
            throw new CustomError('You cannot access this user', 403);
        }
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
        const commonOrg = loggedInUser.organisations.filter(org1 =>
            targetUser.organisations.some(org2 => org1.id === org2.id)
        );
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