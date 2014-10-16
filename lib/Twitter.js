(function () {
    'use strict';

    var NodeTwitter = require('node-twitter'),
        Writable = require('stream').Writable;

    function Twitter() {
    }

    Twitter.prototype.readStream = function (/*lastPostedDate, opts*/) {
        throw new Error('not implemented');
    };

    Twitter.prototype.writeStream = function (opts) {
        var twitterRestClient = new NodeTwitter.RestClient(
                opts.twitterConsumerKey,
                opts.twitterConsumerSecret,
                opts.twitterAccessToken,
                opts.twitterAccessTokenSecret
            ),
            stream = new Writable({objectMode: true});

        stream._write = function (doc, encoding, cb) {
            var reporter = function (error) {
                if (error) {
                    cb(new Error(new Date() + '. Twitter error: ' +
                        (error.code ? error.code + ' ' + error.message : error.message)));
                } else {
                    cb();
                }
            };

            if (doc.image) {

                twitterRestClient.statusesUpdateWithMedia(
                    {status: doc.contentLessThan140Chars, 'mediaExt[]': doc.image},
                    reporter
                );

            } else {

                twitterRestClient.statusesUpdate(
                    {status: doc.contentLessThan140Chars},
                    reporter
                );
            }

        };
        return stream;
    };

    module.exports = Twitter;

}());