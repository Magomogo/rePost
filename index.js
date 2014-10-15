(function () {
    'use strict';

    var request = require('request'),

        GooglePlus = require('./lib/GooglePlus.js'),
        Twitter = require('./lib/Twitter.js');

    module.exports = {

        src: {
            googlePlus: new GooglePlus(request).readStream
        },

        dest: {
            twitter: new Twitter(request).writeStream
        },

        logger: require('./lib/streamLogger.js')
    };

}());