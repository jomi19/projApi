const config = require("./config.json");

module.exports = (function () {
    if (process.env.NODE_ENV === "test") {
        return "mongodb://localhost:27017/testtrading";
    }

    return process.env.tradingApi_DSN || config.DB_URL;
}());
