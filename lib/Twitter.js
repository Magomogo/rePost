(function () {
    'use strict';

    var through = require('through2'),
        RestClient,
        errorHandler;

    function Twitter(_RestClient_, _errorHandler_) {
        RestClient = _RestClient_;
        errorHandler = _errorHandler_ || function () {};
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
            var resultCallback = function (error) {
                this.push(doc);

                if (error) {
                    errorHandler(
                        'Twitter error: ' +
                        (error.code ? error.code + ' ' + error.message : error.message)
                    );
                }
                callback();

            }.bind(this);

            if (doc.image) {

                twitterRestClient.statusesUpdateWithMedia(
                    {status: doc.contentLessThan140Chars, 'mediaExt[]': doc.image},
                    resultCallback
                );

            } else {

                twitterRestClient.statusesUpdate(
                    {status: doc.contentLessThan140Chars},
                    resultCallback
                );
            }

        });
    };

    module.exports = Twitter;

}());