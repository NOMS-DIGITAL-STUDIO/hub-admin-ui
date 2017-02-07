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

    function uploadProspectus (req, res, next) {
        var title = req.body.prospectusTitle;
        var category = req.body.prospectusSubject;
        var file = req.files.prospectusFile;

        uploadFile(title, category, file, req, res,  next);
    }

    function uploadVideo (req, res, next) {
        var title = req.body.videoTitle;
        var category = req.body.videoSubject;
        var file = req.files.videoFile;

        uploadFile(title, category, file, req, res, next);
    }

    function uploadFile(title, category, file, req, res, next){
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

    function prospectus (req, res) {
        res.status(200).render('prospectus', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems
        });
    }

    function video (req, res) {
        res.status(200).render('video', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems
        });
    }

    router.get('/', [list, prospectus]);
    router.post('/', [uploadProspectus, list, prospectus]);

    router.get('/prospectus', [list, prospectus]);
    router.post('/prospectus', [uploadProspectus, list, prospectus]);

    router.get('/video', [list, video]);
    router.post('/video', [uploadVideo, list, video]);

    return {
        router: router
    };

};

