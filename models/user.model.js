const { v4: uuidv4 } = require('uuid');

// Defines user model
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
                notEmpty: {
                    msg: 'Firstname should not be empty',
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
                notEmpty: {
                    msg: 'Lastname should not be empty',
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
                notEmpty: {
                    msg: 'Email should not be empty',
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
                notEmpty: {
                    msg: 'Password should not be empty',
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
          as: 'organisations',
        });
    };

    return userModel;
}

module.exports = User;