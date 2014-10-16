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
        var readStream = function (request, lastPostedDate) {
                return new GooglePlus(request).readStream(lastPostedDate || new Date('1970-01-01'), {
                    googleUserId: '{googleUserId}',
                    googleAPIKey: '{googleAPIKey}'
                });
            },
            tenPublicActivitiesRequest = function () {
                var request = sinon.stub();
                request.yields(null, {statusCode: 200}, JSON.parse(publicActivitiesApiResponse()));
                return request;
            };

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

        it('skips all posts that published before lastPostedDate', function (done) {
            var streamed = [],
                consumer = testStreams.writable(
                    function (doc, enc, cb) {
                        streamed.push(doc.published);
                        cb();
                    },
                    {objectMode: true}
                );

            consumer.on('finish', function () {
                assert.deepEqual(
                    streamed,
                    [
                        new Date('2014-10-12T11:42:10.106Z'),
                        new Date('2014-10-13T01:44:07.220Z'),
                        new Date('2014-10-13T02:00:58.875Z'),
                        new Date('2014-10-13T02:06:47.106Z')
                    ]
                );
                done();
            });

            readStream(tenPublicActivitiesRequest(), new Date('2014-10-09T01:47:46.357Z'))
                .pipe(consumer);

        });
    });

});
