const express = require('express');
const user = require('../modules/user.js');
const router = express.Router();

router.post("/sell", function(req, res) {
    user.trade(res, req, true);
});

router.post("/by", function(req, res) {
    user.trade(res, req);
});


module.exports = router;
