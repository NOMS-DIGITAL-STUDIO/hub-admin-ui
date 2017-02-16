var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var nock = require('nock');
var moment = require('moment');

describe('Upload routes: ', function () {

    var server;

     beforeEach(function () {
        server = require('../../server').server;
    });

    afterEach(function () {
        server.close();
    });

    it('upload response re-states request parameters', function testUpload(done) {

        var postFile = nock('http://localhost:8080')
            .post('/hub-admin/content-items')
            .reply(201);

        var filter = "filter=%7B%27metadata.mediaType%27:%27application/pdf%27%7D";

        var listPdfs = nock('http://localhost:8080')
            .get('/hub-admin/content-items?' + filter)
            .reply(200, {});

        request(server)
            .post('/prospectus')
            .auth('user', 'password')
            .field('metadata', "{title: 'title', category:'category', mediaType: 'application/pdf'}")
            .attach('mainFile', 'test/resources/sample.txt')
            .end(function (err, res) {
                expect(res.status).to.equal(200);

                expect(postFile.isDone()).to.be.true;
                expect(listPdfs.isDone()).to.be.true;

                done();
            });
    });

    it('upload response includes a timestamp', function testUpload(done) {

        var start = moment({second: 0, millisecond: 0});

        var postFile = nock('http://localhost:8080')
            .post('/hub-admin/content-items')
            .reply(201);

        var filter = "filter=%7B%27metadata.mediaType%27:%27application/pdf%27%7D";

        var listPdfs = nock('http://localhost:8080')
            .get('/hub-admin/content-items?' + filter)
            .reply(200, {});

        request(server)
            .post('/prospectus')
            .auth('user', 'password')
            .field('metadata', "{title: 'title', category:'category', mediaType: 'application/pdf'}")
            .attach('mainFile', 'test/resources/sample.txt')
            .end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.text).to.have.string('Saved successfully');

                expect(postFile.isDone()).to.be.true;
                expect(listPdfs.isDone()).to.be.true;

                done();
            });
    });

    it('propagates response status received from hub-admin rest', function testUpload(done) {

        var postFile = nock('http://localhost:8080')
            .post('/hub-admin/content-items')
            .reply(400);

        request(server)
            .post('/prospectus')
            .auth('user', 'password')
            .field('metadata', "{title: 'title', category:'category', mediaType: 'application/pdf'}")
            .attach('mainFile', 'test/resources/sample.txt')
            .end(function (err, res) {
                expect(res.status).to.equal(400);

                expect(postFile.isDone()).to.be.true;

                done();
            });
    });

});
