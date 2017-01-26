var express = require('express');
var router = express.Router();

// Route index page
router.get('/', function (req, res) {
    res.render('index')
});

router.get('/upload-prospectus', function (req, res) {
    res.render('upload-prospectus')
});

router.post('/upload-complete', function (req, res) {
    res.render('upload-complete')
});

module.exports = router;
