require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route')
const organisationRoute = require('./routes/organisation.route');
const errorHandler = require('./middleware/error/errorHandler');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false})); 
app.use(express.json());  //parse json bodies

// keeps render hosting alive 
require('./keepAlive')

// routes
app.get('/', (req, res) => {
  return res.status(200).json({message: 'Hello world'})
})
app.use('/api/users', userRoute);
app.use('/api/organisations', organisationRoute);
app.use ('/auth', authRoute);



// Error handler middleware
app.use(errorHandler);

const startServer = async () => {
    try {
      await sequelize.sync();
      console.log('Connected to database');
    } catch (error) {
      console.error('Unable to connect with database', error);
    }
}

module.exports = {
  app,
  startServer
}