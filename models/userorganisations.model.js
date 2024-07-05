const { v4: uuidv4 } = require('uuid');

const UserOrganisations =  (sequelize, datatype) => {
    const userOrganisationsModel = sequelize.define('UserOrganisations', {
        userId: {
            type: datatype.STRING,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'userId',
            },
          },
          orgId: {
            type: datatype.STRING,
            allowNull: false,
            references: {
              model: 'Organizations',
              key: 'orgId',
            },
          },
    });

    return userOrganisationsModel;
}

module.exports = UserOrganisations;