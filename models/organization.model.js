const { v4: uuidv4 } = require('uuid');

const Organisation =  (sequelize, datatype) => {
    const organisationModel = sequelize.define('Organisation', {
        orgId: {
            type: datatype.STRING,
            primaryKey: true,
            default: () => uuidv4(),
            unique: true,
        },
        name: {
            type: datatype.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Name is required',
                },
            }
        },
        description: {
            type: datatype.STRING,
            allowNull: true,
        }
    });

    organisationModel.associate = models => {
        organisationModel.belongsToMany(models.User, {
          through: 'UserOrganisations',
          foreignKey: 'orgId',
          otherKey: 'userId',
          as: 'users',
        });
    };

    return organisationModel;
}

module.exports = Organisation;