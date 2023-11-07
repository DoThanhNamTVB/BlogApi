const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const DB = require("./config/connectDB");
const initRoute = require("./routes");

//set port server
const port = process.env.PORT || 8001;

//create server with sockit.io
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const server = http.createServer(app);
const io = socketIo(server);

//Morgan : middleware logger (http res, req)
app.use(morgan("dev"));

//Middleware express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Middleware cookie
app.use(cookieParser());

//Middleware cors
app.use(cors());

//connect db
DB.connect();

//router api
initRoute(app);

//middleware error
app.use(notFound);
app.use(errorHandler);

//running server with port
app.listen(port, () => {
    console.log(`server on port ${port}`);
});
