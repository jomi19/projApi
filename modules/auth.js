const dsn = require("../config/database.js");
const mongo = require("mongodb").MongoClient;
const errors = require("./errors");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = process.env.JWT_SECRET || "testingcase";

const auth = {
    /**
     * Function to register a new user
     *
     * @param {*} res
     * @param {*} body
     */


    register: async function(res, body) {
        const email = body.email;
        const userName = body.userName;
        const password = body.password;

        if (!email || !password || !userName) {
            return errors.error(res, 401, "/login", "Email, username or password missing");
        }
        const client = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const db = await client.db();
        const users = await db.collection("users");

        users.findOne({$or: [
            {"userName": userName},
            {"email": email}
        ]}, async function(err, result) {
            if (err) {
                return errors.error(res, 500, "/login", "Database error", err.message);
            }
            if (result !== null) {
                await client.close();
                return errors.error(res, 401, "/login", "Username or email alredy exists");
            }

            bcrypt.hash(password, saltRounds, async function(err, hash) {
                if (err) {
                    await client.close();
                    return errors.error(res, 500, "/rgister", "Bcrypt error");
                }
                await users.insertOne({
                    userName: userName,
                    email: email,
                    password: hash
                });
                await client.close();

                return res.status(201).json({
                    data: {
                        message: "User successfully registered."
                    }
                });
            });
        });
    },

    login: async function(res, body) {
        const email = body.email;
        const password = body.password;
        const loginId = body.loginId;
        const jwtpayload = { email: email };
        const client = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const db = await client.db();
        const users = await db.collection("users");

        if (!loginId || !password) {
            return errors.error(res, 401, "/login", "Email or password missing");
        }
        users.findOne({$or: [
            {"email": loginId},
            {"userName": loginId}
        ]}, async function(err, user) {
            await client.close();
            if (err) {
                return errors.error(res, 500, "/login", "Database error", err.message);
            }
            if (user === null) {
                return errors.error(res, 401, "/login", "No user with that email or username");
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return errors.error(res, 500, "/login", "Bcrypt error");
                }

                if (result) {
                    const token = jwt.sign(jwtpayload, secret, {expiresIn: "1h"});
                    let payload = { token: token, email: user.email, userName:
                        user.userName, currency: user.currency, depot: user.depot};

                    return res.json({
                        type: "succes",
                        message: "User logged in",
                        user: payload
                    });
                }
                return errors.error(res, 401, "/login", "Wrong password",
                    "Password is incorrect");
            });
        });
    },

    checkToken: function(req, res, next) {
        const token = req.headers['x-access-token'];
        if (process.env.NODE_ENV === 'test') {
            console.log("test")
            next();
        } else {
            jwt.verify(token, secret, function(err) {
                if (err) {
                    return errors.error(res, 401, `${req.baseUrl}${req.path}`, "Unauthorized token");
                }
                next();
            });
        }
        

    }
};

module.exports = auth;
