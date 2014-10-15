describe('streamLogger', function () {
    'use strict';

    var assert = require('assert'),
        logger = require(__dirname + '/../lib/streamLogger.js'),
        testStreams = require(__dirname + '/../lib/test/streams.js'),

        doc = function (timestamp, title) {
            return {
                published: timestamp.toUTCString(),
                title: title
            };
        },

        documentsStream = function () {
            return testStreams.readable(
                function () {
                    this.push(doc(new Date('2014-01-01'), 'Happy new year'));
                    this.push(doc(new Date('2014-03-08'), 'Happy woman\'s day'));
                    this.push(doc(new Date('2014-05-09'), 'Happy victory day'));
                    this.push(null);
                },
                {objectMode: true}
            );
        };

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

        documentsStream()
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
                'Wed, 01 Jan 2014 00:00:00 GMT: Happy new year\n' +
                'Sat, 08 Mar 2014 00:00:00 GMT: Happy woman\'s day\n' +
                'Fri, 09 May 2014 00:00:00 GMT: Happy victory day\n',
                log
            );

            done();
        });

        documentsStream().pipe(logger(logDestinationStream));
    });

});