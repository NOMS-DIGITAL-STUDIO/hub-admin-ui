// Dependencies
var bodyParser = require('body-parser');
var express = require('express');
var fileUpload = require('express-fileupload');
var logger = require('winston');
var nunjucks = require('nunjucks');
var path = require('path');


// Configuration
var appConfig = {
    'adminServerRoot': process.env.ADMIN_SERVER_ROOT || 'http://localhost:8080',
    'logLevel': process.env.LOG_LEVEL || 'info',
    'name': 'hub-admin-ui',
    'port': process.env.PORT || 3000,

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

var Routes = require('./app/routes.js');
var routes = new Routes(logger);

var ApiRoutes = require('./app/api.js');
var apiRoutes = new ApiRoutes(hubAdminClient, logger);

//  Express Configuration
var app = express();
app.set('view engine', 'html');
app.set('port', appConfig.port);


// View Engine Configuration
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


// Request Processing Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(fileUpload());


// Express Routing Configuration
// NB Must be after fileupload, bodyparser config
app.use('/', routes.router);
app.use('/api', apiRoutes.router);


//  Static Resources Configuration
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')));
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')));


// GovUK Template Configuration
app.locals.asset_path = '/public/';


// Error Handler
app.use(function (req, res, next) {
    var error = new Error('Not Found');
    err.status = 404;
    next(error);
});

app.use(function (error, req, res, next) {
    res.locals.message = error.message;
    res.locals.error = error;

    res.status(error.status || 500);

    res.render('error');
});


//  Server Startup
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


// Exports
module.exports.app = app;
module.exports.appConfig = appConfig;
