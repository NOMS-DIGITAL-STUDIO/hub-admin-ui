var path = require('path');
var express = require('express');
var fileUpload = require('express-fileupload');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');

var debug = require('debug')('hub-admin-ui');
var logger = require('winston');

var name = 'hub-admin-ui';

var app = express();
var routes = require('./app/routes.js');

logger.level = process.env.LOG_LEVEL || 'info';

debug('booting %s', name);
logger.info('Starting service', {app: name});

app.set('view engine', 'html');

var views = [
    path.join(__dirname, '/app/views/'),
    path.join(__dirname, '/govuk_modules/govuk_template/layouts/')
];

var nunjucksAppEnv = nunjucks.configure(views, {
    autoescape: true,
    express: app,
    noCache: true,
    watch: true
});

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(fileUpload());

app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')));
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')));

// Variable used in paths inside the govuk template files
app.locals.asset_path = '/public/';

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var error = new Error('Not Found');
    err.status = 404;
    next(error);
});

// error handler
app.use(function(error, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? error : {};

    // render the error page
    res.status(error.status || 500);
    res.render('error');
});

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
