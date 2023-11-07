const mongoose = require("mongoose");
require("dotenv").config();

const connect = async () => {
    try {
        await mongoose.connect(process.env.URL_MONGO_DB);
        console.log("connected");
    } catch (error) {
        console.log("Connect fail at : ", error);
        process.exit(1);
    }
};

module.exports = { connect };
