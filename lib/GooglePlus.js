(function () {
    'use strict';

    function GooglePlus(/*request*/) {

    }

    GooglePlus.prototype.readStream = function (/*lastPostedDate, opts*/) {
        throw new Error('not implemented');
    };

    GooglePlus.prototype.writeStream = function (/*opts*/) {
        throw new Error('not implemented');
    };

    module.exports = GooglePlus;

}());