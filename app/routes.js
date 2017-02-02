var express = require('express');
var moment = require('moment');

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
            res.render('index', {
                'contentItems': jsonData.contentItems
            });
        });
    });

    router.post('/', function (req, res) {

        var title = req.body.prospectusTitle;
        var category = req.body.prospectusSubject;
        var file = req.files.prospectusFile;

        hubAdminClient.upload(title, category, file, function (error, status) {
            if (error === null) {
                logger.info('upload successful');

                var resultJson = {
                    'success': true,
                    'filename': file.name,
                    'title': title,
                    'category': category,
                    'timestamp': moment().format('YYYY-MM-DD HH:mm')
                };

                getContentItems(function (jsonData) {
                    res.status(status).render('index', {
                        'uploadDetails': resultJson,
                        'contentItems': jsonData.contentItems
                    });
                });

            } else {
                logger.error('File upload error:', error);
                res.locals.message = error.message;
                res.status(error.status || 500);
                res.locals.error = req.app.get('env') === 'development' ? error : {};
                res.render('error');
            }
        });

    });


    return {
        router: router
    };

};

