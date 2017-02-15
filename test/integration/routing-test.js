var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var nock = require('nock');

describe('Server route config: ', function () {

    var server;

    beforeEach(function () {
        server = require('../../server').server;
    });

    afterEach(function () {
        server.close();
    });

    it('responds to / with the prospectus page', function testSlash(done) {

        var filter = escape("filter={'metadata.mediaType':'application/pdf'}");

        var listPdfs = nock('http://localhost:8080')
            .get('/hub-admin/content-items?' + filter)
            .reply(200, {});

        request(server)
            .get('/')
            .auth('user', 'password')
            .end(function (err, res) {
                expect(res.text).to.have.string('Upload prospectus file');
                expect(res.status).to.equal(200);

                expect(listPdfs.isDone()).to.be.true;

                done();
            });
    });

    it('responds to /prospectus with the prospectus page', function testSlashProspectus(done) {

        var filter = escape("filter={'metadata.mediaType':'application/pdf'}");

        var listPdfs = nock('http://localhost:8080')
            .get('/hub-admin/content-items?' + filter)
            .reply(200, {});

        request(server)
            .get('/prospectus')
            .auth('user', 'password')
            .end(function (err, res) {
                expect(res.text).to.have.string('Upload prospectus file');
                expect(res.status).to.equal(200);

                expect(listPdfs.isDone()).to.be.true;

                done();
            });
    });

    it('responds to /video with the video page', function testSlashVideo(done) {

        var filter = escape("filter={'metadata.mediaType':'video/mp4'}");

        var listVideos = nock('http://localhost:8080')
            .get('/hub-admin/content-items?' + filter)
            .reply(200, {});

        request(server)
            .get('/video')
            .auth('user', 'password')
            .end(function (err, res) {
                expect(res.text).to.have.string('Upload video file');
                expect(res.status).to.equal(200);

                expect(listVideos.isDone()).to.be.true;

                done();
            });
    });

    it('gives 404 when not found', function testPath(done) {
        request(server)
            .get('/foo/bar')
            .auth('user', 'password')
            .expect(404, done);
    });

});
