var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var nock = require('nock');

describe('Server route config: ', function () {

    var server;

    beforeEach(function () {
        server = require('../../server').server;

        var listContentItems = nock('http://localhost:8080')
            .get('/hub-admin/content-items')
            .reply(200, {});
    });

    afterEach(function () {
        server.close();
    });

    it('responds to / with the prospectus page', function testSlash(done) {
        request(server)
            .get('/')
            .end(function (err, res) {
                expect(res.text).to.have.string('Upload prospectus file');
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('responds to /prospectus with the prospectus page', function testSlash(done) {
        request(server)
            .get('/prospectus')
            .end(function (err, res) {
                expect(res.text).to.have.string('Upload prospectus file');
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('responds to /video with the video page', function testSlash(done) {
        request(server)
            .get('/video')
            .end(function (err, res) {
                expect(res.text).to.have.string('Upload video file');
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('gives 404 when not found', function testPath(done) {
        request(server)
            .get('/foo/bar')
            .expect(404, done);
    });

});
