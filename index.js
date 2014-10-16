(function () {
    'use strict';

    var request = require('request'),
        fs = require('fs'),
        through = require('through2'),
        NodeTwitter = require('node-twitter'),

        GooglePlus = require('./lib/GooglePlus.js'),
        Twitter = require('./lib/Twitter.js');

    module.exports = {

        src: {
            googlePlus: new GooglePlus(request).readStream
        },

        dest: {
            twitter: new Twitter(NodeTwitter.RestClient).writeStream,
            publishedDate: function (filePath) {
                return through.obj(function (doc, encoding, callback) {
                    fs.writeFile(filePath, doc.published.toJSON(), callback);
                });
            }
        },

        logger: require('./lib/streamLogger.js'),

        filter: {
            publishedAfter: require('./lib/publishedDateFilter.js')
        }
    };

}());
