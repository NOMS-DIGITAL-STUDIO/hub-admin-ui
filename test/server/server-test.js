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

    //  todo mock out hub-admin to allow running this in circle
    it('responds to /api/upload', function testUpload(done) {

        request(server)
            .post('/api/upload')
            .field('prospectusTitle', 'test')
            .attach('prospectusFile', 'circle.yml')
            .end(function (err, res) {

                res.status.should.equal(201);

                res.body.filename.should.equal('circle.yml');
                res.body.title.should.equal('test');

                done();
            });
    });

    // todo validation error for missing input
    it('gives 400 when no title', function testUpload(done) {

        request(server)
            .post('/api/upload')
            .attach('prospectusFile', 'circle.yml')
            .end(function (err, res) {

                res.status.should.equal(400);

                done();
            });
    });
});
