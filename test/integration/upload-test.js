var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var nock = require('nock');
var moment = require('moment');

describe('Upload routes: ', function () {

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

    it('upload response re-states request parameters', function testUpload(done) {

        var hubAdmin = nock('http://localhost:8080')
            .post('/hub-admin/content-items')
            .reply(201);

        request(server)
            .post('/')
            .field('prospectusTitle', 'aTitle')
            .field('prospectusSubject', 'aSubject')
            .attach('prospectusFile', 'test/resources/sample.txt')
            .end(function (err, res) {

                expect(res.status).to.equal(200);
                done();
            });
    });

    it('upload response includes a timestamp', function testUpload(done) {

        var start = moment({second: 0, millisecond: 0});

        var hubAdmin = nock('http://localhost:8080')
            .post('/hub-admin/content-items')
            .reply(201);

        request(server)
            .post('/')
            .field('prospectusTitle', 'aTitle')
            .field('prospectusSubject', 'aSubject')
            .attach('prospectusFile', 'test/resources/sample.txt')
            .end(function (err, res) {

                expect(res.status).to.equal(200);
                expect(res.text).to.have.string('Saved successfully');

                done();
            });

    });

    it('propagates response status received from hub-admin rest', function testUpload(done) {

        var hubAdmin = nock('http://localhost:8080')
            .post('/hub-admin/content-items')
            .reply(400);

        request(server)
            .post('/')
            .field('prospectusTitle', 'aTitle')
            .field('prospectusSubject', 'aSubject')
            .attach('prospectusFile', 'test/resources/sample.txt')
            .end(function (err, res) {

                expect(res.status).to.equal(400);

                done();
            });
    });

});
