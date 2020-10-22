const express = require('express');
const user = require('../modules/user.js');
const router = express.Router();
const auth = require("./../modules/auth.js");

router.post("/register", function(req, res) {
    auth.register(res, req.body);
});

router.post("/login", function(req, res) {
    console.log(req.body)
    auth.login(res, req.body);
});

router.get("/", 
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => user.getUser(res, req)
)

router.post("/insert", 
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => user.insert(res, req)
)

router.post("/test",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => user.byStock(res, req)
)

module.exports = router;
