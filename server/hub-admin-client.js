var unirest = require('unirest');
var fs = require('fs');

module.exports = function HubAdminClient(appConfig, logger) {

    var doUpload = function (title, category, file, callback) {

        unirest.post(appConfig.adminServerRoot + '/hub-admin/content-items')
            .headers({'Content-Type': 'multipart/form-data'})
            .field('title', title)
            .field('category', category)
            .attach('file', './uploads/' + file.name)
            .end(function (res) {
                if (res.error) {
                    logger.error('File upload error', res.error);
                    callback(res.error, null);
                } else {
                    logger.info('File upload response', res.status);
                    callback(null, res.status);
                }
            });
    };

    var upload = function (title, category, file, callback) {

        logger.info('Uploading a file:', {'title': title, 'category': category, 'filename': file.name});

        logger.debug('Contents of uploads folder:');
        fs.readdir('./uploads', function (err, items) {
            logger.debug(items);
        });

        file.mv('./uploads/' + file.name, function (err) {
            if (err) {
                logger.error('Failed to move file:', err);
            } else {
                doUpload(title, category, file, callback);
            }
        });
    };



    return {
        upload: upload
    };
};

