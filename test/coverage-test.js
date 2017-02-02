// Require all JS files else coverage is misleadingly high

require('../server/hub-admin-client.js');
require('../server.js');
require('../app/api.js');
require('../app/routes.js');

// Can't load the GDS toolkit js. todo fix, separate our stuff
//require('../assets/javascripts/application.js');
