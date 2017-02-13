var assert = require('chai').assert;
var expect = require('chai').expect;
var nock = require('nock');

var logger = require('winston');


describe('Hub Admin Client: ', function () {

    var HubAdminClient;
    var client;

    var appConfig = {
        'adminServerRoot': 'http://localhost:8080',
        'userName' : 'user',
        'password' : 'password'
    };

    beforeEach(function () {
        HubAdminClient = require('../server/hub-admin-client.js');
        client = new HubAdminClient(appConfig, logger);
    });

    it('gives list of all content items as the response body', function (done) {

        var listContentItems = nock('http://localhost:8080')
            .get("/hub-admin/content-items?filter=%7B%27metadata.mediaType%27:%27application/pdf%27%7D")
            .reply(200, {'contentItems': 'stubbed response'});

        client.list('application/pdf', function (error, body) {

            assert.ifError(error);
            expect(body.contentItems).to.equal('stubbed response');

            done();
        });
    });


    it('returns error when rest service call results in error', function (done) {

        var listContentItems = nock('http://localhost:8080')
            .get('/hub-admin/content-items?filter=%7B%27metadata.mediaType%27:%27application/pdf%27%7D"')
            .replyWithError('something went wrong');

        client.list('application/pdf', function (error, body) {

            assert.isNull(body);
            assert.isNotNull(error);

            done();
        });
    });

});
