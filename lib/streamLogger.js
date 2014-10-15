(function () {
    'use strict';

    var through = require('through2');

    module.exports = function (writeStream) {

        var throughStream = through.obj(function (doc, enc, callback) {
            writeStream.write(doc.published + ': ' + doc.title + '\n');
            callback(null, doc);
        });

        throughStream.on('finish', function () {
            writeStream.emit('finish');
        });

        return throughStream;
    };

}());