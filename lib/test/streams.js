(function () {
    'use strict';

    module.exports = {
        readable: function (readCallback, opts) {
            var stream = require('stream').Readable(opts);
            stream._read = readCallback;
            return stream;
        },

        writable: function (writeCallback, opts) {
            var stream = require('stream').Writable(opts);
            stream._write = writeCallback;
            return stream;
        },

        devNull: function () {
            return this.writable(function (chunk, encoding, callback) { callback(); });
        },

        rePostDocuments: function () {
            var doc = function (timestamp, title) {
                return {
                    title: title,
                    contentLessThan140Chars: title,
                    published: timestamp
                };
            };

            return this.readable(
                function () {
                    this.push(doc(new Date('2014-01-01T10:11:03.000Z'), 'Happy new year'));
                    this.push(doc(new Date('2014-03-08T11:22:33.000Z'), 'Happy woman\'s day'));
                    this.push(doc(new Date('2014-05-09T15:32:43.000Z'), 'Happy victory day'));
                    this.push(null);
                },
                {objectMode: true}
            );
        }
    };

}());