describe('streamLogger', function () {
    'use strict';

    var assert = require('assert'),
        logger = require(__dirname + '/../lib/streamLogger.js'),
        testStreams = require(__dirname + '/../lib/test/streams.js');

    it('passes through all incoming documents', function (done) {
        var documentsPassedThrough = 0,
            someConsumer = testStreams.writable(
                function (doc, encoding, callback) {
                    documentsPassedThrough = documentsPassedThrough + 1;
                    callback();
                },
                {objectMode: true}
            );

        someConsumer.on('finish', function () {
            assert.equal(3, documentsPassedThrough);
            done();
        });

        testStreams.rePostDocuments()
            .pipe(logger(testStreams.devNull()))
            .pipe(someConsumer);
    });

    it('writes text representation of a rePost document', function (done) {
        var log = '',
            logDestinationStream = testStreams.writable(function (chunk, encoding, callback) {
                log += chunk;
                callback();
            });

        logDestinationStream.on('finish', function () {
            assert.equal(
                'NOK 2014-01-01T10:11:03.000Z: Happy new year\n' +
                'NOK 2014-03-08T11:22:33.000Z: Happy woman\'s day\n' +
                'NOK 2014-05-09T15:32:43.000Z: Happy victory day\n',
                log
            );

            done();
        });

        testStreams.rePostDocuments().pipe(logger(logDestinationStream));
    });

});