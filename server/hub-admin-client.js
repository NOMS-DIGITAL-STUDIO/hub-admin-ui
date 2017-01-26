var unirest = require('unirest');

module.exports = function HubAdminClient(appConfig) {

    var upload = function (title, file, callback) {

        file.mv('./uploads/' + file.name, function (err) {
            if (err) {
                console.log('move error');
                console.log(err);
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
                    console.log('File upload error', res.error);
                    callback(res.error, null)
                } else {
                    console.log('File upload response', res.status);
                    callback(null, res.status)
                }
            });
    };

    return {
        upload: upload
    };
};

