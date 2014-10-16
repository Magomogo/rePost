(function () {
    'use strict';

    var Readable = require('stream').Readable,
        createRePostDocument = require(__dirname + '/googlePlus/createRePostDocument.js'),

        request;

    function GooglePlus(_request_) {
        request = _request_;
    }

    function publicActivitiesUrl(ops) {
        return 'https://www.googleapis.com/plus/v1/people/' +
            ops.googleUserId + '/activities/public?maxResults=10&key=' + ops.googleAPIKey;
    }

    function requestAndPushRePostDocuments(uri, readableStream) {
        request({uri: uri, json: true}, function (error, response, json) {
            var items, current, itemDate, converted;

            if (error || (response.statusCode !== 200)) {
                readableStream.emit(
                    'error',
                    new Error(new Date() + '. GooglePlus.readStream error ' + (error || response.statusCode))
                );
            } else {
                items = json.items || [];

                while ((current = items.pop())) {
                    itemDate = new Date(current.published);

                    converted = createRePostDocument(current);

                    if (converted) {
                        readableStream.push(converted);
                    }
                }

                readableStream.push(null);
            }

        });
    }

    GooglePlus.prototype.readStream = function (opts) {
        var stream = new Readable({objectMode: true}),
            done = false;

        stream._read = function () {
            if (!done) {
                done = true;
                requestAndPushRePostDocuments(publicActivitiesUrl(opts), this);
            }
        };

        return stream;
    };

    GooglePlus.prototype.writeStream = function (/*opts*/) {
        throw new Error('not implemented');
    };

    module.exports = GooglePlus;

}());