"use strict";

const dsn = require("../config/database.js");
const mongo = require("mongodb").MongoClient;
const errors = require("./errors");

const user = {
    getUser: async function(res, req) {
        const userName = req.body.userName;
        const email = req.body.email;
        const url = req.baseUrl;
        const path = req.path;
        const client = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const db = await client.db();
        const users = await db.collection("users");

        if (!userName || !email) {
            return errors.error(res, 401, `${url}${path}`, "Unauthorized, need to login first");
        }
        console.log(userName);
        console.log(email);
        users.findOne(
            {email: email, userName: userName},
            async function(err, user) {
                await client.close();
                if (err) {
                    return errors.error(res, 500, "/login", "Database error", err.message);
                }
                if (user === null) {
                    return errors.error(res, 401, `${url}${path}`, "Unauthorized no account");
                }

                return res.status(201).json({
                    email: user.email,
                    userName: user.userName,
                    currency: user.currency || 0,
                    depot: user.depot || [],
                    history: user.history || false
                });
            });
    },

    insert: async function(res, req) {
        const userName = req.body.userName;
        const email = req.body.email;
        const url = req.baseUrl;
        const path = req.path;
        let amount = req.body.amount;
        // const operator = req.body.operator
        const client = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const db = await client.db();
        const users = await db.collection("users");

        if (!parseFloat(amount)) {
            return errors.error(res, 400, `${url}${path}`, "Amount needs to be an int or float");
        }
        amount = parseFloat(amount);

        if (!userName || !email) {
            console.log("inget email eller användar");
            return errors.error(res, 401, `${url}${path}`, "Unauthorized, need to login first");
        }

        users.findOne(
            {email: email, userName: userName},
            async function(err, user) {
                if (err) {
                    await client.close();
                    return errors.error(res, 500, "/login", "Database error", err.message);
                }
                if (user === null) {
                    await client.close();
                    return errors.error(res, 401, `${url}${path}`, "Unauthorized");
                }
                let currency = user.currency || 0;
                let newCurrency = currency + amount;

                await users.updateOne({email: email, userName: userName}, { $set:
                    {currency: newCurrency}
                }, async function(err) {
                    await client.close();
                    if (err) {
                        let message = err.message;

                        return errors.error(res, 500, `${url}${path}`, "Database error", message);
                    }
                    console.log(req.body);
                    return res.status(200).json({
                        currency: newCurrency
                    });
                }

                );
            }
        );
    },

    /// EDIT SO IT TAKES CURRENT PRICE FROM DATABASE
    trade: async function(res, req, sell = false) {
        const userName = req.body.userName;
        const email = req.body.email;
        const client = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const db = await client.db();
        const users = await db.collection("users");
        const url = req.baseUrl;
        const path = req.path;
        let amount = req.body.amount;
        let stockPrice = req.body.stockPrice;
        let totalPrice = 0;
        let newCurrency = 0;
        let depot = {};
        const stockName = req.body.stockName;

        if (!userName || !email) {
            return errors.error(res, 401, `${url}${path}`, "Unauthorized, no username/email");
        }
        if (!parseInt(amount) || !parseFloat(stockPrice)) {
            return errors.error(res, 400, `${url}${path}`, "Amount needs to be an int or float");
        }

        amount = parseInt(amount);
        stockPrice = parseFloat(stockPrice);
        totalPrice = stockPrice * amount;
        await users.findOne({email: email, userName: userName}, async function(err, result) {
            if (err) {
                return errors.error(res, 500, `${url}${path}`, "Database error", err.message);
            }

            if (result === null) {
                return errors.error(res, 401, `${url}${path}`, "Cant find user");
            }
            if (!result.currency || totalPrice > result.currency) {
                if (!sell) {
                    return errors.error(res, 401, `${url}${path}`, "Not enough currency");
                }
            }

            if (sell) {
                newCurrency = result.currency + totalPrice;
            } else {
                newCurrency = result.currency - totalPrice;
            }

            depot = result.depot || [];

            let i = depot.findIndex(function(stock) {
                if (stock.title ===  stockName) {
                    return true;
                }
            });


            if (i < 0) {
                if (sell) {
                    return errors.error(res, 401, `${url}${path}`, "No of that stock in depot");
                }

                depot.push({title: stockName, amount: amount});
            } else if (depot[i].amount < amount && sell) {
                return errors.error(res, 401, `${url}${path}`, "Not enough stocks to sell");
            } else {
                if (sell) {
                    depot[i] = {title: stockName, amount: depot[i].amount - amount};
                } else {
                    depot[i] = {title: stockName, amount: depot[i].amount + amount};
                }
            }



            users.updateOne({email: email, userName: userName}, {$set: {
                depot: depot,
                currency: newCurrency
            }}, async function(err) {
                await client.close();
                if (err) {
                    return await errors.error(res, 500, `${req.baseUrl}${req.path}`,
                        "Database error", err.message);
                }
                console.log("Hej");
                return res.status(201).json({currency: newCurrency, depot: depot});
            });
        });
    }
};

module.exports = user;
