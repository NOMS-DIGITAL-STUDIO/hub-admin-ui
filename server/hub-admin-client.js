var unirest = require('unirest');
var fs = require('fs');

module.exports = function HubAdminClient(appConfig, logger) {

    var uploadToAdminService = function (title, category, file, next) {

        unirest.post(appConfig.adminServerRoot + '/hub-admin/content-items')
            .headers({'Content-Type': 'multipart/form-data'})
            .field('title', title)
            .field('category', category)
            .attach('file', './uploads/' + file.name)
            .end(function (response) {
                if (response.error) {
                    logger.error('File upload error', response.error);
                    next(response.error, null);
                } else {
                    logger.info('File upload response', response.status);
                    next(null, response.status);
                }
            });
    };

    var upload = function (title, category, file, next) {

        logger.info('Uploading a file:', {'title': title, 'category': category, 'filename': file.name});

        logger.debug('Contents of uploads folder:');
        fs.readdir('./uploads', function (error, items) {
            logger.debug(items);
        });

        file.mv('./uploads/' + file.name, function (error) {
            if (error) {
                logger.error('Failed to move file:', error);
            } else {
                uploadToAdminService(title, category, file, next);
            }
        });
    };

    var getAllContentItems = function(next){

        unirest.get(appConfig.adminServerRoot + '/hub-admin/content-items')
            .end(function(response) {
                if (response.error) {
                    logger.error('Get content items error', response.error);
                    next(response.error, null);
                } else {
                    logger.info('Get content items response', response.status);
                    next(null, response.body);
                }
            });
    }



    return {
        upload: upload,
        list: getAllContentItems
    };
};

