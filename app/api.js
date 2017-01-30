// /api integration routes eg for AJAX calls

var express = require('express');

module.exports = function Routes(hubAdminClient, logger) {

    var router = express.Router();

    router.post('/upload', function (req, res) {

        var title = req.body.prospectusTitle;
        var file = req.files.prospectusFile;

        hubAdminClient.upload(title, file, function (error, status) {
            if (error === null) {
            logger.info('upload successful');
                res.render('index');
            } else {
                logger.error('File upload error:', error);
                res.locals.message = error.message;
                res.status(error.status || 500);
                res.locals.error = req.app.get('env') === 'development' ? error : {};
                res.render('error');
            }
        });

    });

    return {
        router: router
    };

};
