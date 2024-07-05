const { v4: uuidv4 } = require('uuid');

const User =  (sequelize, datatype) => {
    const userModel = sequelize.define('User', {
        userId: {
            type: datatype.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4(),
            unique: true,
            allowNull: false,
        },
        firstName: {
            type: datatype.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Firstname is required',
                },
            }
        },
        lastName: {
            type: datatype.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Lastname is required',
                },
            }
        },
        email: {
            type: datatype.STRING,
            allowNull: false,
            unique: {
                msg: 'Email address must be unique'
            },
            validate: {
                notNull: {
                    msg: 'Email is required',
                },
            }
        },
        password: {
            type: datatype.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Password is required',
                },
            }
        },
        phone: {
            type: datatype.STRING,
            allowNull: true,
        }
    })

    userModel.associate = models => {
        userModel.belongsToMany(models.Organisation, {
          through: 'UserOrganisations',
          foreignKey: 'userId',
          otherKey: 'orgId',
          as: 'organizations',
        });
    };

    return userModel;
}

module.exports = User;