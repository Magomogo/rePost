(function () {
    'use strict';

    var repost = require('repost'),

        lastestPostedDate = new Date(
            fs.existsSync('/tmp/rePost_latestPostedDate.txt') ?
                fs.readFileSync('/tmp/rePost_latestPostedDate.txt').toString() : '1970-01-01'
        );

    repost.googlePlus(lastestPostedDate, {
            googleUserId: undefined,
            googleAPIKey: undefined
        })
        .pipe(repost.logger(process.stdout))
        .pipe(repost.twitter({
            twitterConsumerKey: undefined,
            twitterConsumerSecret: undefined,
            twitterAccessToken: undefined,
            twitterAccessTokenSecret: undefined
        }));

}());