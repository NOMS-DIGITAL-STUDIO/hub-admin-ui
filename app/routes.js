var express = require('express');
var moment = require('moment');
var formidable = require('formidable');
var util = require('util');

module.exports = function Routes(appConfig, hubAdminClient, logger) {

    var router = express.Router();

    router.get('/health', healthCheck);

    router.get('/', [listAll, contentList]);

    router.get('/create-content', function (req, res, next) {
        res.render('create-content');
    });

    router.get('/prospectus', [listProspectus, prospectus]);
    router.get('/prospectus/:id', [loadItem, listProspectus, prospectus]);
    router.post('/prospectus', [uploadFiles, listProspectus, prospectus]);
    router.post('/prospectus/:id', [updateItem, loadItem, listProspectus, prospectus]);

    router.get('/video', [listVideo, video]);
    router.get('/video/:id', [loadItem, listVideo, video]);
    router.post('/video', [uploadFiles, listVideo, video]);
    router.post('/video/:id', [updateItem, loadItem, listVideo, video]);

    router.get('/book', [listBook, book]);
    router.get('/book/:id', [loadItem, listBook, book]);
    router.post('/book', [uploadFiles, listBook, book]);
    router.post('/book/:id', [updateItem, loadItem, listBook, book]);

    router.get('/radio', [listRadio, radio]);
    router.get('/radio/:id', [loadItem, listRadio, radio]);
    router.post('/radio', [uploadFiles, listRadio, radio]);
    router.post('/radio/:id', [updateItem, loadItem, listRadio, radio]);

    function healthCheck(req, res, next) {
        var health = {
            'health': {
                'status': 'UP',
                'timestamp': moment().format('YYYY-MM-DD HH:mm'),
                'version': appConfig.version
            }
        };
        res.status(200).send(health);
    }

    function listAll(req, res, next) {
        list(req, res, '', next);
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

    function listRadio(req, res, next) {
        list(req, res, 'radio', next);
    }

    function list(req, res, contentType, next) {
        getList(req, res, contentType, function (error, jsonData) {
            if (error === null) {
                res.contentItems = jsonData.contentItems;
                return next();
            } else {
                if (error.code == 'ECONNREFUSED') {
                    logger.error(util.inspect(error))
                    error.message = 'Hub Admin API connection error'
                }
                logger.error('upload error');
                next(error);
            }
        });
    }

    function getList(req, res, contentType, callback) {
        hubAdminClient.list(contentType, function (error, jsonData) {
            listResponseHandler(error, jsonData, callback);
        });
    }

    function listResponseHandler(error, jsonData, callback) {
        if (error === null) {
            logger.info('get list successful');
            logger.debug('get items response: ' + JSON.stringify(jsonData));
            callback(null, jsonData);
        } else {
            callback(error, null);
        }
    }

    function uploadFiles(req, res, next) {

        var incomingForm = new formidable.IncomingForm();

        var metadata = {};
        var files = [];
        var fileLabels = [];

        incomingForm.on('field', function (field, value) {
            metadata[field] = value;
        });

        incomingForm.on('file', function (field, file) {
            if (file.size > 0) {
                fileLabels.push(field);
                files.push(file);
            }
        });

        incomingForm.on('end', function () {
            metadata.fileLabels = fileLabels;
            hubAdminClient.upload(metadata, files, function (error, response) {
                handleUploadResponse(error, res, next);
            });
        });

        incomingForm.parse(req);
    }

    function handleUploadResponse(error, res, next) {

        if (error === null) {
            logger.info('upload successful');
            res.resultJson = resultDetails();
            next();

        } else {
            logger.error('upload error');
            next(error);
        }
    }

    function resultDetails() {
        return {
            'success': true,
            'timestamp': moment().format('YYYY-MM-DD HH:mm')
        };
    }

    function loadItem(req, res, next) {
        hubAdminClient.findById(req.params.id, function (error, response) {
            handleFindResponse(error, response, res, next);
        });
    }

    function handleFindResponse(error, response, res, next) {

        if (error === null) {
            logger.info('find item successful');
            logger.info(response);
            res.originalItem = response;
            next();

        } else {
            logger.info('find item error');
            next(error);
        }
    }

    function updateItem(req, res, next) {

        var incomingForm = new formidable.IncomingForm();

        var newMetadata = {};
        var item = {};

        incomingForm.on('field', function (field, value) {
            if (field == 'originalItem') {
                item = JSON.parse(value);
            } else {
                newMetadata[field] = value;
            }
        });

        incomingForm.on('end', function () {
            item.metadata = newMetadata;

            hubAdminClient.updateById(req.params.id, item, function (error, response) {
                handleUploadResponse(error, res, next);
            });
        });

        incomingForm.parse(req);
    }

    function contentList(req, res) {
        res.status(200).render('all-content-items', {
            'contentItems': res.contentItems
        });
    }

    function prospectus(req, res) {
        res.status(200).render('prospectus', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems,
            'originalItem': res.originalItem
        });
    }

    function video(req, res) {
        res.status(200).render('video', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems,
            'originalItem': res.originalItem
        });
    }

    function book(req, res) {
        res.status(200).render('book', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems,
            'originalItem': res.originalItem
        });
    }

    function radio(req, res) {
        res.status(200).render('radio', {
            'uploadDetails': res.resultJson,
            'contentItems': res.contentItems,
            'originalItem': res.originalItem
        });
    }

    function redirectHome(req, res) {
        res.redirect('/');
    }

    return {
        router: router
    };

};

