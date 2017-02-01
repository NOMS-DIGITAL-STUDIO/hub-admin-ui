// /api integration routes eg for AJAX calls
'use strict';

var express = require('express');
var moment = require('moment');

module.exports = function ApiRoutes(hubAdminClient, logger) {

    var router = express.Router();

    router.post('/upload', function (req, res) {

        var title = req.body.prospectusTitle;
        var category = req.body.prospectusSubject;
        var file = req.files.prospectusFile;

        hubAdminClient.upload(title, category, file, function (error, status) {
            if (error === null) {
                logger.info('upload successful');

                var resultJson = {
                    'filename': file.name,
                    'title': title,
                    'category': category,
                    'timestamp': moment().format('YYYY-MM-DD HH:mm')
                };

                res.status(status).send(resultJson);

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
