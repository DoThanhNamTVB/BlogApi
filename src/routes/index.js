const blogRoutes = require("./Blog");
const userRoutes = require("./User");

const initRouter = (app) => {
    app.use("/api/news", blogRoutes);
    app.use("/api/users", userRoutes);
};

module.exports = initRouter;
