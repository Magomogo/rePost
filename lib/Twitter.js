(function () {
    'use strict';

    var through = require('through2'),
        RestClient;

    function Twitter(_RestClient_) {
        RestClient = _RestClient_;
    }

    Twitter.prototype.readStream = function (/*lastPostedDate, opts*/) {
        throw new Error('not implemented');
    };

    Twitter.prototype.writeStream = function (opts) {
        var twitterRestClient = new RestClient(
            opts.twitterConsumerKey,
            opts.twitterConsumerSecret,
            opts.twitterAccessToken,
            opts.twitterAccessTokenSecret
        );

        return through.obj(function (doc, encoding, callback) {
            var reporter = function (error) {
                this.push(doc);

                if (error) {
                    callback(new Error(new Date() + '. Twitter error: ' +
                        (error.code ? error.code + ' ' + error.message : error.message)));
                } else {
                    callback();
                }
            }.bind(this);

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

        });
    };

    module.exports = Twitter;

}());