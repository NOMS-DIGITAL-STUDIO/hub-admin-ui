var assert = require('chai').assert;
var expect = require('chai').expect;
var nock = require('nock');

var logger = require('winston');


describe('Hub Admin Client: ', function () {

    var HubAdminClient;
    var client;

    var appConfig = {
        'adminServerRoot': 'http://localhost:8090',
        'userName' : 'user',
        'password' : 'password'
    };

    beforeEach(function () {
        HubAdminClient = require('../server/hub-admin-client.js');
        client = new HubAdminClient(appConfig, logger);
    });

    it('gives list of all content items as the response body', function (done) {

        var filter = "filter=%7B%27metadata.contentType%27:%27prospectus%27%7D";

        var listContentItems = nock('http://localhost:8090')
            .get("/hub-admin/content-items?" + filter)
            .reply(200, {'contentItems': 'stubbed response'});

        client.list('prospectus', function (error, body) {

            assert.ifError(error);
            expect(body.contentItems).to.equal('stubbed response');

            done();
        });
    });


    it('returns error when rest service call results in error', function (done) {

        var filter = "filter=%7B%27metadata.contentType%27:%27prospectus%27%7D";

        var listContentItems = nock('http://localhost:8090')
            .get("/hub-admin/content-items?" + filter)
            .replyWithError('something went wrong');

        client.list('prospectus', function (error, body) {

            assert.isNull(body);
            assert.isNotNull(error);

            done();
        });
    });

});
