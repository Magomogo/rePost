describe('Twitter', function () {
    'use strict';

    var assert = require('assert'),
        sinon = require('sinon'),
        Twitter = require(__dirname + '/../lib/Twitter.js'),
        testStreams = require(__dirname + '/../lib/test/streams.js');

    describe('writeStream', function () {
        var requestReturnValue = {
                form: function () {
                    return { append: function () { return this;} };
                }
            },
            requestMock = function () {
                return {
                    post: function (uri, opts, callback) {
                        process.nextTick(callback);
                        return requestReturnValue;
                    },
                    get: function () {}
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
                .pipe(new Twitter(requestMock()).writeStream({}))
                .pipe(someConsumer);

        });

        it('indicates that rePost document has been republished', function (done) {
            var assertConsumer = testStreams.writable(
                    function (doc) {
                        assert(doc.rePublished);
                        done();
                    },
                    {objectMode: true}
                );

            testStreams.rePostDocuments()
                .pipe(new Twitter(requestMock()).writeStream({}))
                .pipe(assertConsumer);
        });

        it('repeats without image when twitter responds with 403 error', function (done) {
            var request = requestMock(),
                assertConsumer = testStreams.writable(
                    function () {
                        sinon.assert.calledTwice(request.post);
                        done();
                    },
                    {objectMode: true}
                );

            sinon.stub(request, 'post');

            request.post
                .withArgs('https://api.twitter.com/1.1/statuses/update_with_media.json')
                .yields(null, {statusCode: 403})
                .returns(requestReturnValue);

            request.post
                .withArgs('https://api.twitter.com/1.1/statuses/update.json')
                .yields(null, {statusCode: 200})
                .returns(requestReturnValue);

            testStreams.readable(function () {
                    this.push({
                        image: 'some uri'
                    });
                    this.push(null);
                }, {objectMode: true})
                .pipe(new Twitter(request).writeStream({}))
                .pipe(assertConsumer);
        });
    });

});