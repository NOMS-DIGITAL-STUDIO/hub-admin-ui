// Dependencies
var bodyParser = require('body-parser');
var express = require('express');
var logger = require('winston');
var path = require('path');

/* jshint ignore:start */
var nunjucks = require('nunjucks');
/* jshint ignore:end */

// Configuration
var appConfig = {
    'adminServerRoot': process.env.ADMIN_SERVER_ROOT || 'http://localhost:8080',
    'userName': process.env.USER_NAME || 'user',
    'password': process.env.PASSWORD || 'password',
    'logLevel': process.env.LOG_LEVEL || 'info',
    'name': 'hub-admin-ui',
    'port': process.env.PORT || 3000
};


// Logger configuration
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
    //json: true
});


// Startup
logger.info('Starting service', {app: appConfig.name});
logger.info('Starting service with configuration:', appConfig);


// Server Configuration
logger.level = appConfig.logLevel;

var HubAdminClient = require('./server/hub-admin-client.js');
var hubAdminClient = new HubAdminClient(appConfig, logger);
var hubAuth = require('./server/hub-auth.js');


var Routes = require('./app/routes.js');
var routes = new Routes(hubAdminClient, logger);

//  Express Configuration
var app = express();
app.set('view engine', 'html');
app.set('port', appConfig.port);


// View Engine Configuration
/* jshint ignore:start */
var views = [
    path.join(__dirname, '/app/views/'),
    path.join(__dirname, '/govuk_modules/govuk_template/layouts/')
];
/* jshint ignore:end */


/* jshint ignore:start */
var nunjucksAppEnv = nunjucks.configure(views, {
    autoescape: true,
    express: app,
    noCache: true,
    watch: true
});

var dateFilter = require('nunjucks-date-filter');
nunjucksAppEnv.addFilter('date', dateFilter);
dateFilter.setDefaultFormat('HH:MM on DD/MM/YYYY');

/* jshint ignore:end */

// Request Processing Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// Express Routing Configuration
// NB Must be after fileupload, bodyparser config
app.use('/', hubAuth.basicAuth(appConfig.userName, appConfig.password));
app.use('/', routes.router);


//  Static Resources Configuration
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')));
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')));


// GovUK Template Configuration
/* jshint ignore:start */
app.locals.asset_path = '/public/';
/* jshint ignore:end */

// Error Handler
app.use(function (req, res, next) {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(logErrors);
app.use(clientErrors);

function logErrors (err, req, res, next) {
    logger.error('Unhandled error: ' + err.stack);
    next(err);
}

function clientErrors (error, req, res, next) {
    res.locals.message = error.message;
    res.locals.error = error;

    res.status(error.status || 500);

    res.render('error');
}


//  Server Startup
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


// Exports
module.exports.server = server;
module.exports.appConfig = appConfig;
