const { startServer, app } = require("./app");
require('dotenv').config();
const PORT = process.env.PORT || 5000;


const connect = async () => {
    try {
        await startServer();
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    } catch (err) {
        console.log(err);
    }
}

connect();