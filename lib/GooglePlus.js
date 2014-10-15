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

            if (!response || (error && response.statusCode !== 200)) {
                throw new Error(new Date() + '. Request error.');
            } else {
                var items = json.items || [], i;

                for (i = 0; i < items.length; i += 1) {
                    var itemDate = new Date(items[i].published), converted;

                    if (itemDate > lastPostedDate) {
                        converted = createRePostDocument(items[i]);

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