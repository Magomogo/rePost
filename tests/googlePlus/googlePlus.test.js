describe('GooglePlus', function () {
    'use strict';

    var sinon = require('sinon'),
        assert = require('assert'),
        testStreams = require(__dirname + '/../../lib/test/streams.js'),

        GooglePlus = require(__dirname + '/../../lib/GooglePlus.js');

    describe('reader', function () {
        var readStream = function (request, lastPostedDate) {
            return new GooglePlus(request).readStream(lastPostedDate || new Date('1970-01-01'), {
                googleUserId: '{googleUserId}',
                googleAPIKey: '{googleAPIKey}'
            });
        };

        it('requests last 10 public activities', function () {
            var request = sinon.spy();

            readStream(request).pipe(testStreams.devNull());

            sinon.assert.calledOnce(request);
            sinon.assert.calledWith(
                request,
                { uri: 'https://www.googleapis.com/plus/v1/' +
                    'people/{googleUserId}/activities/public?maxResults=10&key={googleAPIKey}',
                  json: true }
            );

        });

        it('reads all rePostDocuments', function (done) {
            var request = sinon.stub(),
                readCounter = 0,
                consumer = testStreams.writable(
                    function (doc, enc, cb) {
                        readCounter += 1;
                        cb();
                    },
                    {objectMode: true}
                );

            request.yields(null, {statusCode: 200}, require(__dirname + '/data/publicActivitiesApiResponse.json'));

            consumer.on('finish', function () {
                assert.equal(10, readCounter);
                done();
            });

            readStream(request).pipe(consumer);
        });
    });

});
