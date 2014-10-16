(function () {
    'use strict';

    var through = require('through2');

    module.exports = function (date) {

        return through.obj(function (doc, enc, callback) {
            if (doc.published > date) {
                this.push(doc);
            }
            callback();
        });
    };

}());