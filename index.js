require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route')
const organisationRoute = require('./routes/organisation.route')

const PORT = process.env.PORT || 5000;


const app = express();

app.use(express.json());  //parse json bodies


// routes
app.use('/api/users', userRoute);
app.use('/api/organisations', organisationRoute);
app.use ('/auth', authRoute);

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