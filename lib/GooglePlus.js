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

    GooglePlus.prototype.readStream = function (lastPostedDate, opts) {
        var stream = new Readable({objectMode: true});
        stream._read = function () {};

        request({uri: publicActivitiesUrl(opts), json: true}, function (error, response, json) {
            var items = json.items || [], current, itemDate, converted;

            if (!response || (error && response.statusCode !== 200)) {
                throw new Error(new Date() + '. Request error.');
            } else {
                while( (current = items.pop()) ) {
                    itemDate = new Date(current.published);

                    if (itemDate > lastPostedDate) {
                        converted = createRePostDocument(current);

                        if (converted) {
                            stream.push(converted);
                        }
                    }
                }

                stream.push(null);
            }

        });

        return stream;
    };

    GooglePlus.prototype.writeStream = function (/*opts*/) {
        throw new Error('not implemented');
    };

    module.exports = GooglePlus;

}());