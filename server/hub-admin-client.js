var request = require('request');
var unirest = require('unirest');
var fs = require('fs');


module.exports = function HubAdminClient(appConfig, logger) {

    var authConfig = {
        user: appConfig.userName,
        pass: appConfig.password,
        sendImmediately: true
    };

    var unirestAuthConfig = {
        user: appConfig.userName,
        pass: appConfig.password
    };

    var contentItemsUrl = appConfig.adminServerRoot + '/hub-admin/content-items';


    function getContentItems(contentType, callback) {
        unirest.get(contentItemsUrl)
            .query(filterFor(contentType))
            .auth(unirestAuthConfig)
            .end(function (response) {
                listCompletionHandler(response, callback);
            });
    }

    function filterFor(contentType) {
        if (contentType) {
            return "filter={'metadata.contentType':'" + contentType + "'}";
        }
        return 'filter={}';
    }

    function listCompletionHandler(response, callback) {
        if (response.error) {
            logger.error('Get content items error ' + response.error);
            callback(response.error, null);
        } else {
            logger.info('Get content items response ' + response.status);
            callback(null, response.body);
        }
    }

    function upload(metadata, files, callback) {

        logger.info('Commencing file upload');

        var formData = {
            metadata: JSON.stringify(metadata),
            file: fileSpecsFor(files)
        };

        var postData = {
            auth: authConfig,
            url: contentItemsUrl,
            formData: formData,
            preambleCRLF: true,
            postambleCRLF: true
        };

        request.post(postData, function complete(error, apiResponse, body) {
            uploadCompletionHandler(error, apiResponse, callback);
        });
    }

    function fileSpecsFor(files) {
        var fileSpecs = [];

        for (var i = 0; i < files.length; i++) {
            fileSpecs.push(fileSpecFor(files[i]));
        }

        return fileSpecs;
    }

    function fileSpecFor(file) {
        return {
            value: fs.createReadStream(file.path),
            options: {
                filename: file.name
            }
        };
    }

    function uploadCompletionHandler(error, apiResponse, callback) {

        if (error) {
            callback(error, null);

        } else if (apiResponse.statusCode >= 400) {
            error = new Error('Admin API error');
            error.status = apiResponse.statusCode;
            callback(error, null);

        } else {
            logger.info('admin API upload successful');
            callback(null, apiResponse.statusCode);

        }
    }

    function findById(id, callback){

        logger.info('Finding item by id: ' + id);

        unirest.get(contentItemsUrl + "/" + id)
            .auth(unirestAuthConfig)
            .end(function (response) {
                findCompletionHandler(response, callback);
            });
    }

    function findCompletionHandler(response, callback) {
        if (response.error) {
            logger.error('Find by id error ' + response.error);
            callback(response.error, null);
        } else {
            logger.info('Find by id response ' + response.status);
            callback(null, response.body);
        }
    }

    function updateById(id, contentItem, callback){

        logger.info('Updating item by id: ' + id);
        unirest.put(contentItemsUrl + "/" + id)
            .auth(unirestAuthConfig)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(contentItem)
            .end(function (response) {
                updateCompletionHandler(response, callback);
            });
    }

    function updateCompletionHandler(response, callback) {
        if (response.error) {
            logger.error('Update by id error ' + response.error);
            callback(response.error, null);
        } else {
            logger.info('Update by id response ' + response.status);
            callback(null, response.status);
        }
    }

    return {
        upload: upload,
        list: getContentItems,
        findById: findById,
        updateById: updateById
    };
}
;

