// Page routes

var express = require('express');

module.exports = function Routes(hubAdminClient, logger) {

    var router = express.Router();

    function getContentItems(next) {
        hubAdminClient.list(function (error, jsonData) {
            if (error === null) {
                logger.info('get list successful');
                logger.debug('get items response: ' + JSON.stringify(jsonData));
                next(jsonData);
            } else {
                logger.error('Get list error:', error);
                res.locals.message = error.message;
                res.status(error.status || 500);
                res.locals.error = req.app.get('env') === 'development' ? error : {};
                res.render('error');
            }
        });
    }

    router.get('/', function (req, res) {
        getContentItems(function (jsonData) {
            res.render('index', {'contentItems': jsonData.contentItems});
        });
    });

    return {
        router: router
    };

};

