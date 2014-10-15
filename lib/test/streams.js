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
        }
    };

}());