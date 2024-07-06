const { v4: uuidv4 } = require('uuid');

// Intermer=diate model for user-orgnaisation to facilitate MtoM relationship
const UserOrganisations =  (sequelize, datatype) => {
    const userOrganisationsModel = sequelize.define('UserOrganisations', {
        userId: {
            type: datatype.STRING,
            references: {
              model: 'Users',
              key: 'userId',
            },
            allowNull: false,
          },
          orgId: {
            type: datatype.STRING,
            references: {
              model: 'Organisations',
              key: 'orgId',
            },
            allowNull: false,
          },
    });

    return userOrganisationsModel;
}

module.exports = UserOrganisations;