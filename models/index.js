const { Sequelize, DataTypes } = require('sequelize');
const User = require('./user.model');
const Organisation = require('./organization.model');
const UserOrganisations = require('./userorganisations.model');

// Create a new sequelize instance
// const sequelize =  new Sequelize({
//     dialect: 'postgres',
//     host: process.env.DB_HOST,
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     logging: false
// })

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  },
  logging: false
});

// db object that holds db related properties
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = User(sequelize, DataTypes);
db.Organisation = Organisation(sequelize, DataTypes);
db.UserOrganisations = UserOrganisations(sequelize, DataTypes);

// Add model's association/relationship
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
});

module.exports = db;