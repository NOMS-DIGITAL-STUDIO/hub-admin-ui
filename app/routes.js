var express = require('express');
var moment = require('moment');
var formidable = require('formidable');

module.exports = function Routes(hubAdminClient, logger) {

    var router = express.Router();

    function listResponseHandler(error, jsonData, callback) {
        if (error === null) {
            logger.info('get list successful');
            logger.debug('get items response: ' + JSON.stringify(jsonData));
            callback(jsonData);
        } else {
            logger.error('Get list error: ' + error);
            callback(error);
        }
    }

    function getList(req, res, contentType, callback) {
        hubAdminClient.list(contentType, function (error, jsonData) {
            listResponseHandler(error, jsonData, callback);
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

    function resultDetails() {
        return {
            'success': true,
            'timestamp': moment().format('YYYY-MM-DD HH:mm')
        };
    }

    function handleUploadResponse(error, res, next) {

        if (error === null) {
            logger.info('upload successful');
            res.resultJson = resultDetails();
            next();

        } else {
            logger.info('upload error');
            next(error);
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

