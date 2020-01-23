var expect  = require('chai').expect;
var request = require('request');
var appVersion = process.env.npm_package_version

describe('Status and content', function() {
    describe ('Main page', function() {
        it('status', function(done){
            request('http://localhost:9001/', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('content', function(done) {
            request('http://localhost:9001/' , function(error, response, body) {
                var appVersion = process.env.npm_package_version
                expect(body).to.equal("Application version - " + appVersion);
                done();
            });
        });
    });

    describe ('About page', function() {
        it('status', function(done){
            request('http://localhost:9001/about', function(error, response, body) {
                expect(response.statusCode).to.equal(404);
                done();
            });
        });

    });
});