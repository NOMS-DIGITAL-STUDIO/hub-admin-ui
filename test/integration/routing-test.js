var assert = require('assert');
var should = require('should');
var request = require('supertest');

describe('Server route config: ', function () {

    var server;

    beforeEach(function () {
        server = require('../../server').server;
    });

    afterEach(function () {
        server.close();
    });

    it('responds to /', function testSlash(done) {
        request(server)
            .get('/')
            .expect(200, done);
    });

    it('gives 404 when not found', function testPath(done) {
        request(server)
            .get('/foo/bar')
            .expect(404, done);
    });

});
