var unirest = require('unirest');

module.exports = function HubAdminClient(appConfig, logger) {

    var upload = function (title, file, callback) {

        logger.info('Uploading a file:', {'title': title, 'file name': file.name})

        file.mv('./uploads/' + file.name, function (err) {
            if (err) {
                logger.error('Failed to move file:', err)
            } else {
                doUpload(title, file, callback);
            }
        });
    };

    var doUpload = function (title, file, callback) {

        unirest.post(appConfig.adminServerRoot + '/hub-admin/content-items')
            .headers({'Content-Type': 'multipart/form-data'})
            .field('title', title)
            .attach('file', './uploads/' + file.name)
            .end(function (res) {
                if (res.error) {
                    logger.error('File upload error', res.error);
                    callback(res.error, null)
                } else {
                    logger.info('File upload response', res.status);
                    callback(null, res.status)
                }
            });
    };

    return {
        upload: upload
    };
};

