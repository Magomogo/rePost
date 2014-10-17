(function () {
    'use strict';

    var Readable = require('stream').Readable,
        createRePostDocument = require(__dirname + '/googlePlus/createRePostDocument.js'),

        request,
        errorHandler;

    function GooglePlus(_request_, _errorHandler_) {
        request = _request_;
        errorHandler = _errorHandler_ || function () {};
    }

    function publicActivitiesUrl(ops) {
        return 'https://www.googleapis.com/plus/v1/people/' +
            ops.googleUserId + '/activities/public?maxResults=10&key=' + ops.googleAPIKey;
    }

    function requestPublicActivities(uri, readableStream, callback) {

        request({uri: uri, json: true}, function (error, response, json) {
            if (error || (response.statusCode !== 200)) {
                errorHandler('GooglePlus.readStream error ' + (error || response.statusCode));
            } else {
                callback(null, json.items || []);
            }
        });
    }

    GooglePlus.prototype.readStream = function (opts) {
        var stream = new Readable({objectMode: true}),
            activities,
            feedDocument = function () {
                var current, converted;
                if ( !(current = activities.pop()) ) {
                    stream.push(null);
                } else {
                    converted = createRePostDocument(current);
                    if (converted) {
                        stream.push(converted);
                    } else {
                        feedDocument();
                    }
                }
            };

        stream._read = function () {
            if (activities === undefined) {
                requestPublicActivities(publicActivitiesUrl(opts), this, function (err, items) {
                    activities = items;
                    feedDocument();
                });
            } else {
                feedDocument();
            }
        };

        return stream;
    };

    GooglePlus.prototype.writeStream = function (/*opts*/) {
        throw new Error('not implemented');
    };

    module.exports = GooglePlus;

}());