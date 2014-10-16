describe('publishedDateFilter', function () {
    'use strict';

    var assert = require('assert'),
        filter = require(__dirname + '/../lib/publishedDateFilter.js'),
        testStreams = require(__dirname + '/../lib/test/streams.js');

    it('passes through only rePost documents that was published after specific date', function (done) {
       var documentsPassedThrough = 0,
           someConsumer = testStreams.writable(
           function (doc, encoding, callback) {
               documentsPassedThrough += 1;
               callback();
           },
           {objectMode: true}
       );

        someConsumer.on('finish', function () {
            assert.equal(1, documentsPassedThrough);
            done();
        });

        testStreams.rePostDocuments()
            .pipe(filter(new Date('2014-03-08T11:22:33.000Z')))
            .pipe(someConsumer);

    });

});