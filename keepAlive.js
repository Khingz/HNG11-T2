const axios = require('axios');

// URL of your Express server from environment variable
const url = 'https://hng11-t2.onrender.com';

// Function to make a GET request to the root route
const keepAwake = async () => {
  try {
    await axios.get(url);
    console.log(`Pinged ${url} successfully`);
  } catch (error) {
    console.error(`Error pinging ${url}:`, error.message);
  }
};

// Set interval to ping the server every 25 minutes
setInterval(keepAwake, 10 * 60 * 1000);

// Initial call to start the process immediately
keepAwake();