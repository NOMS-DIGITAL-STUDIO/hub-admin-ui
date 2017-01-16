// features/step_definitions/hooks.js
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({After}) {
  After(function() {
    return this.driver.quit();
  });
});