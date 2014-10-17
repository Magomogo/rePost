describe('GooglePlus', function () {
    'use strict';

    var fs = require('fs'),
        sinon = require('sinon'),
        assert = require('assert'),
        testStreams = require(__dirname + '/../../lib/test/streams.js'),

        GooglePlus = require(__dirname + '/../../lib/GooglePlus.js'),

        publicActivitiesApiResponse = function () {
            return fs.readFileSync(__dirname + '/data/publicActivitiesApiResponse.json', {encoding: 'utf-8'});
        };

    describe('reader', function () {
        var readStream = function (request, errHandler) {
                return new GooglePlus(request, errHandler).readStream({
                    googleUserId: '{googleUserId}',
                    googleAPIKey: '{googleAPIKey}'
                });
            },
            tenPublicActivitiesRequest = function () {
                var request = sinon.stub();
                request.yields(null, {statusCode: 200}, JSON.parse(publicActivitiesApiResponse()));
                return request;
            };

        it('does request only on demand', function () {
            var request = sinon.spy();
            sinon.assert.notCalled(request);
            readStream(request);
        });

        it('requests last 10 public activities', function () {
            var request = sinon.spy();

            readStream(request).pipe(testStreams.devNull());

            sinon.assert.calledOnce(request);
            sinon.assert.calledWith(
                request,
                {
                    uri: 'https://www.googleapis.com/plus/v1/' +
                    'people/{googleUserId}/activities/public?maxResults=10&key={googleAPIKey}',
                    json: true
                }
            );

        });

        it('reads all rePostDocuments', function (done) {
            var readCounter = 0,
                consumer = testStreams.writable(
                    function (doc, enc, cb) {
                        readCounter += 1;
                        cb();
                    },
                    {objectMode: true}
                );

            consumer.on('finish', function () {
                assert.equal(10, readCounter);
                done();
            });

            readStream(tenPublicActivitiesRequest()).pipe(consumer);
        });

        it('orders rePostDocuments chronologically', function (done) {
            var previousTimestamp = new Date('1970-01-01'),
                consumer = testStreams.writable(
                    function (doc, enc, cb) {
                        assert(doc.published > previousTimestamp);
                        previousTimestamp = doc.published;
                        cb();
                    },
                    {objectMode: true}
                );

            consumer.on('finish', done);

            readStream(tenPublicActivitiesRequest()).pipe(consumer);
        });

        it('user errHandler to handle errors', function (done) {
            var request = sinon.stub();
            request.yields(null, {statusCode: 404}, null);

            readStream(request, function (err) {
                    assert(err);
                    done();
                })
                .pipe(testStreams.devNull());

        });
    });

});
