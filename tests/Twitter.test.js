describe('Twitter', function () {
    'use strict';

    var assert = require('assert'),
        sinon = require('sinon'),
        Twitter = require(__dirname + '/../lib/Twitter.js'),
        testStreams = require(__dirname + '/../lib/test/streams.js');

    describe('writeStream', function () {
        var successfulTwitterClient = function () {
            var stub = sinon.stub();
            stub.yields(null);
            return {
                statusesUpdate: stub
            };
        };


        it('passes rePost documents through', function (done) {
            var documentsPassedThrough = 0,
                someConsumer = testStreams.writable(
                    function (doc, encoding, callback) {
                        documentsPassedThrough += 1;
                        callback();
                    },
                    {objectMode: true}
                );

            someConsumer.on('finish', function () {
                assert.strictEqual(3, documentsPassedThrough);
                done();
            });

            testStreams.rePostDocuments()
                .pipe(new Twitter(successfulTwitterClient).writeStream({}))
                .pipe(someConsumer);

        });

        it('indicates that rePost document has been republished', function () {
            var assertConsumer = testStreams.writable(
                    function (doc, encoding, callback) {
                        assert(doc.rePublished);
                        callback();
                    },
                    {objectMode: true}
                );

            testStreams.rePostDocuments()
                .pipe(new Twitter(successfulTwitterClient).writeStream({}))
                .pipe(assertConsumer);
        });
    });

});