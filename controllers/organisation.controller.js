const CustomError = require("../middleware/error/customError");
const db = require("../models");

const getUserOrganisations = async (req, res, next) => {
    try {
        const userOrg = await db.User.findByPk(req.userId, {
            include: {
                model: db.Organisation,
                as: 'organisations',
                through: {
                    attributes: []
                }
            }
        });
        const orgs = [];
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

const getSingleOrganisation = async (req, res, next) => {
    try {
        const { orgId } = req.params;
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
        const plainOrg = userOrganisation.get({ plain: true });
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
        res.status(403).json({
            status: 'Bad reuest',
            message: 'You are not authorized to get this organisation',
            statusCode: 403
        });
    } catch(err) {
        next(err);
    }
}

module.exports = {
    getUserOrganisations,
    getSingleOrganisation
}