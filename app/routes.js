var express = require('express');
var moment = require('moment');
var multiparty = require('multiparty');

module.exports = function Routes(hubAdminClient, logger) {

    var router = express.Router();

    var count;

    function getList(req, res, contentType, callback) {
        hubAdminClient.list(contentType, function (error, jsonData) {
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

    function listProspectus(req, res, next) {
        list(req, res, 'prospectus', next);
    }

    function listVideo(req, res, next) {
        list(req, res, 'video', next);
    }

    function listBook(req, res, next) {
        list(req, res, 'book', next);
    }

    function listAll(req, res, next) {
        list(req, res, '', next);
    }

    function list(req, res, contentType, next) {
        getList(req, res, contentType, function (jsonData) {
            res.contentItems = jsonData.contentItems;
            return next();
        });
    }

    function uploadFiles(req, res, next) {

        var uploadPromises = [];

        var form = new multiparty.Form();

        var metadata = {};

        form.on('field', function (name, value) {

            logger.info('Field: ' + name + ':' + value)

            metadata[name] = value;
        });

        form.on('part', function (part) {

            if (part.filename) {

                logger.info('File upload detected: ' + part.filename);
                logger.info('Form part name ' + part.name);
                logger.info('File byte count ' + part.byteCount);
                logger.info('File content type ' + part.headers['content-type']);

                metadata.mediaType = part.headers['content-type'];

                uploadPromises.push(uploadFile(metadata, part));
            }

            part.on('error', function (error) {
                next(error);
            });
        });

        form.on('error', function (error) {
            next(error);
        });

        form.on('close', function () {
            logger.info('closing');

            Promise.all(uploadPromises).then(function () {
                    logger.info('all promises done');

                    res.resultJson = {
                        'success': true,
                        'timestamp': moment().format('YYYY-MM-DD HH:mm')
                    };

                    next();
                },
                function (err) {
                    logger.info('all promises err');
                    next(err);
                });

        });

        form.parse(req);
    }

    function uploadFile(metadata, part) {
        return new Promise(function (resolve, reject) {

            logger.info('uploading ' + part.name);
            hubAdminClient.upload(metadata, part, function (error, response) {

                if (error === null) {
                    logger.info('upload successful');
                    resolve(logger.info('resolving ' + part.name));

                } else {
                    logger.error('File upload error: ' + error);
                    reject(err);
                }
            });
        });
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

    function book(req, res) {
        res.status(200).render('book', {
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

    router.get('/prospectus', [listProspectus, prospectus]);
    router.post('/prospectus', [uploadFiles, listProspectus, prospectus]);

    router.get('/video', [listVideo, video]);
    router.post('/video', [uploadFiles, listVideo, video]);

    router.get('/book', [listBook, book]);
    router.post('/book', [uploadFiles, listBook, book]);

    return {
        router: router
    };

};

