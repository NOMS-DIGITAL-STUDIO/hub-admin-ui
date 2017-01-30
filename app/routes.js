// Page routes

var express = require('express');

module.exports = function Routes(logger) {

    var router = express.Router();

    router.get('/', function (req, res) {
        res.render('index');
    });

    return {
        router: router
    };

};

