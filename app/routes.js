var express = require('express');
var moment = require('moment');
var multiparty = require('multiparty');

module.exports = function Routes(hubAdminClient, logger) {

    var router = express.Router();

    function getList(req, res, mediaType, callback) {
        hubAdminClient.list(mediaType, function (error, jsonData) {
            if (error === null) {
                logger.info('get list successful');
                logger.debug('get items response: ' + JSON.stringify(jsonData));
                callback(jsonData);
            } else {
                logger.error('Get list error: ' + error);
                callback(error);
            }
        });
    }

    function listPdf(req, res, next) {
        list(req, res, 'application/pdf', next);
    }

    function listVideo(req, res, next) {
        list(req, res, 'video/mp4', next);
    }

    function listAll(req, res, next) {
        list(req, res, '', next);
    }

    function list(req, res, mediaType, next) {
        getList(req, res, mediaType, function (jsonData) {
            res.contentItems = jsonData.contentItems;
            return next();
        });
    }

    function uploadFiles(req, res, next) {

        var form = new multiparty.Form();

        var metadata = {};

        form.on('field', function (name, value) {
            metadata[name] = value;
        });

        form.on('part', function (part) {

            if (part.filename) {

                logger.info('File upload detected: ' + part.filename);
                logger.debug('Form part name ' + part.name);
                logger.debug('File byte count ' + part.byteCount);
                logger.debug('File content type ' + part.headers['content-type']);

                metadata.mediaType = part.headers['content-type'];

                hubAdminClient.upload(metadata, part, function (error, response) {

                    if (error === null) {
                        logger.info('upload successful');

                        res.resultJson = {
                            'success': true,
                            'filename': part.filename,
                            'timestamp': moment().format('YYYY-MM-DD HH:mm')
                        };

                        // todo
                        // Have to "consume" the file here. Doesn't work if not.
                        // Need to call next to get back into the express flow, but that stops us handling another file
                        // Calling next in the form onClose callback doesn't wait for the fileupload
                        // To allow multiple files to be uploaded from one form, need to work out the callback sequence
                        // to trigger next() at the right time.
                        next();

                    } else {
                        logger.error('File upload error: ' + error);
                        next(error);
                    }
                });
            }

            part.on('error', function (error) {
                next(error);
            });
        });

        form.on('error', function (error) {
            next(error);
        });

        form.on('close', function () {
            logger.debug('closing');
        });

        form.parse(req);
    }

    function prospectus(req, res) {
        res.status(200).render('prospectus', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems
        });
    }

    function video(req, res) {
        res.status(200).render('video', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems
        });
    }

    function contentList(req, res) {
        res.status(200).render('all-content-items', {
            'contentItems': res.contentItems
        });
    }

    router.get('/', [listAll, contentList]);

    router.get('/prospectus', [listPdf, prospectus]);
    router.post('/prospectus', [uploadFiles, listPdf, prospectus]);

    router.get('/video', [listVideo, video]);
    router.post('/video', [uploadFiles, listVideo, video]);

    return {
        router: router
    };

};

