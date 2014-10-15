describe('streamLogger', function () {
    'use strict';

    var assert = require('assert'),
        logger = require(__dirname + '/../lib/streamLogger.js'),

        doc = function (timestamp, title) {
            return {
                published: timestamp.toUTCString(),
                title: title
            };
        },

        aConsumer = function (writeCallback, opts) {
            var stream = require('stream').Writable(opts);
            stream._write = writeCallback;
            return stream;
        },

        documentsStream = function () {
            var stream = require('stream').Readable({objectMode: true});

            stream._read = function () {
                this.push(doc(new Date('2014-01-01'), 'Happy new year'));
                this.push(doc(new Date('2014-03-08'), 'Happy woman\'s day'));
                this.push(doc(new Date('2014-05-09'), 'Happy victory day'));
                this.push(null);
            };
            return stream;
        };

    it('passes through all incoming documents', function (done) {
        var documentsPassedThrough = 0,
            someConsumer = aConsumer(
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
            .pipe(logger(aConsumer(function () {})))
            .pipe(someConsumer);
    });

    it('writes text representation of a rePost document', function (done) {
        var log = '',
            logDestinationStream = aConsumer(function (chunk, encoding, callback) {
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