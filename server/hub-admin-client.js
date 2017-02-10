var request = require('request');
var unirest = require('unirest');
var util = require('util');


module.exports = function HubAdminClient(appConfig, logger) {

    var upload = function (metadata, file, callback) {

        logger.debug('Commencing file upload');

        logger.debug('File upload detected:' + file.filename);
        logger.debug('File byte count ' + file.byteCount);
        logger.debug('File content type ' + file.headers['content-type']);


        var formData = {
            title: metadata.title,
            category: metadata.category,
            //mediaType: metadata.mediaType,
            file: {
                value: file,
                options: {
                    filename: file.filename,
                    contentType: file.headers['content-type'],
                    knownLength: file.byteCount
                }
            }
        };

        logger.debug('formData: ' + util.inspect(formData));

        request.post({
                auth: {
                    'user': appConfig.userName,
                    'pass': appConfig.password,
                    'sendImmediately': true
                },
                url: appConfig.adminServerRoot + '/hub-admin/content-items',
                formData: formData,
                preambleCRLF: true,
                postambleCRLF: true
            },

            function complete(error, apiResponse, body) {

                if (error) {
                    callback(error, null);

                } else if (apiResponse.statusCode >= 400) {
                    error = new Error('Admin API error');
                    error.status = apiResponse.statusCode;
                    callback(error, null);

                } else   {
                    logger.info('admin API upload successful');
                    callback(null, apiResponse.status);

                }
            });
    };

    var getAllContentItems = function (callback) {

        unirest.get(appConfig.adminServerRoot + '/hub-admin/content-items')
            .auth({
                user: appConfig.userName,
                pass: appConfig.password
            })
            .end(function (response) {
                if (response.error) {
                    logger.error('Get content items error ' + response.error);
                    callback(response.error, null);
                } else {
                    logger.info('Get content items response ' + response.status);
                    callback(null, response.body);
                }
            });
    };

    return {
        upload: upload,
        list: getAllContentItems
    };
}
;

