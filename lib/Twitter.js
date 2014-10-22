(function () {
    'use strict';

    var through = require('through2'),
        request,
        errorHandler;

    function Twitter(_request_, _errorHandler_) {
        request = _request_;
        errorHandler = _errorHandler_ || function () {};
    }

    function newStatus(status, auth, callback) {
        request.post(
            'https://api.twitter.com/1.1/statuses/update.json',
            { oauth: auth },
            callback
        )
        .form()
        .append('status', status);
    }

    function newStatusWithMedia(status, imageUri, auth, callback) {
        var form = request.post(
            'https://api.twitter.com/1.1/statuses/update_with_media.json',
            { oauth: auth },
            callback
        )
        .form();

        form.append('status', status);
        form.append('media[]', request.get(imageUri));
    }

    Twitter.prototype.readStream = function (/*lastPostedDate, opts*/) {
        throw new Error('not implemented');
    };

    Twitter.prototype.writeStream = function (opts) {
        var auth = {
            /*jshint camelcase: false */
            consumer_key: opts.twitterConsumerKey,
            consumer_secret: opts.twitterConsumerSecret,
            token: opts.twitterAccessToken,
            token_secret: opts.twitterAccessTokenSecret
        };

        return through.obj(function (doc, encoding, callback) {
            var resultCallback = function (error, response, body) {
                if (response && (response.statusCode !== 200)) {
                    error = {
                        code: response.statusCode,
                        message: body
                    };
                }

                if (error) {
                    errorHandler(
                        'Twitter error: ' +
                        (error.code ? error.code + ' ' + error.message : error.message)
                    );
                } else {
                    doc.rePublished = new Date();
                }
                this.push(doc);
                callback();

            }.bind(this);

            if (doc.image) {
                newStatusWithMedia(doc.contentLessThan140Chars, doc.image, auth, function (err, resp, body) {
                    if (resp && (resp.statusCode === 403)) {
                        newStatus(doc.contentLessThan140Chars, auth, resultCallback);
                    } else {
                        resultCallback(err, resp, body);
                    }
                });
            } else {
                newStatus(doc.contentLessThan140Chars, auth, resultCallback);
            }

        });
    };

    module.exports = Twitter;

}());