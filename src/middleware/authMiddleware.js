const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decode.userId).select("-password");

            next();
        } catch (error) {
            res.status(401);
            console.log(error);
            throw new Error("No authorized, no token");
        }
    } else {
        res.status(401);
        throw new Error("No authorized, no token");
    }
};

module.exports = { protect };
