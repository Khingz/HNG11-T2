require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;


const app = express();

const connect = async () => {
    try {
      await sequelize.sync();
      console.log('Connected to database');
      app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    } catch (error) {
      console.error('Unable to connect with database', error);
    }
}

connect();