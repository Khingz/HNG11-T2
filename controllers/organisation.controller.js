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
            message: 'Organisation fetch successfully',
            data: {
                organisations: orgs
            }
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getUserOrganisations
}