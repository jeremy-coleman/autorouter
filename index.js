var AutoRouter = require("./dist/autorouter.min.js").AutoRouter;
module.exports = function (options) {
    return new AutoRouter(options).getRouter();
};
