var express = require('express');
var moment = require('moment');

module.exports = function Routes(hubAdminClient, logger) {

    var router = express.Router();

    function getContentItems(req, res, next) {
        hubAdminClient.list(function (error, jsonData) {
            if (error === null) {
                logger.info('get list successful');
                logger.debug('get items response: ' + JSON.stringify(jsonData));
                next(jsonData);
            } else {
                logger.error('Get list error: ' + error);
                next(error);
            }
        });
    }

    function list (req, res, next) {
        getContentItems(req, res, function (jsonData) {
            res.contentItems = jsonData.contentItems;
            return next();
        });
    }

    function upload (req, res, next) {
        var title = req.body.prospectusTitle;
        var category = req.body.prospectusSubject;
        var file = req.files.prospectusFile;

        hubAdminClient.upload(title, category, file, function (error, status) {
            if (error === null) {
                logger.info('upload successful');

                res.resultJson = {
                    'success': true,
                    'filename': file.name,
                    'title': title,
                    'category': category,
                    'timestamp': moment().format('YYYY-MM-DD HH:mm')
                };

                return next();

            } else {
                logger.error('File upload error: ' + error);
                next(error);
            }
        });
    }

    function display (req, res) {
        res.status(200).render('index', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems
        });
    }

    router.get('/', [list, display]);
    router.post('/', [upload, list, display]);

    return {
        router: router,
        list: list,
        upload: upload,
        display: display
    };

};

