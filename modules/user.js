"use strict";

const dsn = require("../config/database.js");
const mongo = require("mongodb").MongoClient;
const errors = require("./errors");
const auth = require("./auth.js");

const user = {
    getUser: async function(res, req) {
        const userName = req.body.userName;
        const email = req.body.email;
        const client = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const db = await client.db();
        const users = await db.collection("users");

        if(!userName || !email) {
            return errors.error(res, 401, `${req.baseUrl}${req.path}`, "Unauthorized, need to login first");
        }
        users.findOne(
            {email: email, userName: userName},
            async function(err, user) {
                await client.close();
                if (err) {
                    return errors.error(res, 500, "/login", "Database error", err.message);
                }
                if(user === null) {
                    return errors.error(res, 401, `${req.baseUrl}${req.path}`, "Unauthorized");
                }

                return res.status(201).json({
                    email: user.email,
                    userName: user.userName,
                    currency: user.currency || 0,
                    depot: user.depot || [],
                    history: user.history || false
                })
        })
    },

    insert: async function(res, req) {
        const userName = req.body.userName;
        const email = req.body.email;
        let amount = req.body.amount.replace(",", ".");
        // const operator = req.body.operator
        const client = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const db = await client.db();
        const users = await db.collection("users");
        
        if(!parseFloat(amount)) {
            return errors.error(res, 400, `${req.baseUrl}${req.path}`, "Amount needs to be an int or float");
        }
        amount = parseFloat(amount)

        if(!userName || !email) {
            console.log("inget email eller användar")
            return errors.error(res, 401, `${req.baseUrl}${req.path}`, "Unauthorized, need to login first");
        }

        users.findOne(
            {email: email, userName: userName},
            async function(err, user) {
                if (err) {
                    await client.close();
                    return errors.error(res, 500, "/login", "Database error", err.message);
                }
                if(user === null) {
                    await client.close();
                    return errors.error(res, 401, `${req.baseUrl}${req.path}`, "Unauthorized");
                }
                let currency = user.currency || 0;
                let newCurrency = currency + amount

                await users.updateOne({email: email, userName: userName},{ $set:
                    {currency: newCurrency}
                    }, async function(err, result) {
                        await client.close();
                        if (err) {
                            return errors.error(res, 500, `${req.baseUrl}${req.path}`, "Database error", err.message);
                        }
                        console.log(req.body)
                        return res.status(200).json({
                            currency: newCurrency
                        })
                        
                    }
                    
                )


            }
        )
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
        let amount = req.body.amount;
        let stockPrice = req.body.stockPrice
        let totalPrice = 0;
        let newCurrency = 0;
        let depot = {};
        const stockName = req.body.stockName;

        if(!userName || !email) {
            return errors.error(res, 401, `${req.baseUrl}${req.path}`, "Unauthorized, need to login first");
        }
        if(!parseInt(amount) || !parseFloat(stockPrice)) {
            return errors.error(res, 400, `${req.baseUrl}${req.path}`, "Amount needs to be an int or float");
        }

        amount = parseInt(amount);
        stockPrice = parseFloat(stockPrice);
        totalPrice = stockPrice * amount;
        await users.findOne({email: email, userName: userName}, async function(err, result) {
            if(err) {
                
                return errors.error(res, 500, `${req.baseUrl}${req.path}`, "Database error", err.message);
            }
            if(!result.currency) {
                console.log("test")
                return errors.error(res, 401, `${req.baseUrl}${req.path}`, "Not enough currency");
            }

            if(sell) {
                newCurrency = result.currency + totalPrice;
            } else {
                newCurrency = result.currency - totalPrice;
            }
            
            depot = result.depot || [];
            
            console.log("test")
            let stockIndex = depot.findIndex(function(stock, index) {
                if(stock.title ===  stockName) {
                    return true;
                }
            })


            if(stockIndex < 0) {
                if(sell) {
                    return errors.error(res, 401, `${req.baseUrl}${req.path}`, "No stocks to sell");
                }

                depot.push({title: stockName, amount: amount});
            } else if(depot[stockIndex].amount < amount && sell) {
                return errors.error(res, 401, `${req.baseUrl}${req.path}`, "Not enough stocks to sell");
            }

            console.log(depot[stockIndex].amount < amount)
                
            if (sell) {
                depot[stockIndex] = {title: stockName, amount: depot[stockIndex].amount - amount};
            } else {
                depot[stockIndex] = {title: stockName, amount: depot[stockIndex].amount + amount};
            }

            users.updateOne({email: email, userName: userName}, {$set: {
                depot: depot,
                currency: newCurrency
            }}, async function(err, newRes) {
                await client.close();
                if (err) {
                    return await errors.error(res, 500, `${req.baseUrl}${req.path}`, "Database error", err.message);
                }
                console.log("Hej")
                return res.status(201).json({currency: newCurrency, depot: depot})
            })
            
        })

       
    }
}

module.exports = user;
