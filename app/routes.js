var express = require('express');
var router = express.Router();

var hubAdminClient = require('../server/hub-admin-client.js');

// Route index page
router.get('/', function (req, res) {
    res.render('index');
});

router.get('/upload-prospectus', function (req, res) {
    res.render('upload-prospectus');
});


router.post('/upload-complete', function (req, res) {

    console.log(req.files);



    hubAdminClient.upload(req.body.title, req.files.file, function (error, status) {
        if(error === null) {
            console.log("result", status);
            res.render('upload-complete', {status: status});
        } else {
            res.locals.message = error.message;
            res.status(error.status || 500);
            res.locals.error = req.app.get('env') === 'development' ? error : {};
            res.render('error');
        }
    });

});


module.exports = router;
