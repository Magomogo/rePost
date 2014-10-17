(function () {
    'use strict';

    var fs = require('fs'),
        repost = require('repost'),

        latestPostedDate = new Date(
            fs.existsSync('/tmp/rePost_latestPostedDate.json') ?
                require('/tmp/rePost_latestPostedDate.json')
                :
                '1970-01-01'
        );

    repost.src.googlePlus({
            googleUserId: undefined,
            googleAPIKey: undefined
        })
        .pipe(repost.filter.publishedAfter(latestPostedDate))
        .pipe(repost.dest.twitter({
            twitterConsumerKey: undefined,
            twitterConsumerSecret: undefined,
            twitterAccessToken: undefined,
            twitterAccessTokenSecret: undefined
        }))
        .pipe(repost.logger(process.stdout))
        .pipe(repost.dest.publishedDate('/tmp/rePost_latestPostedDate.json'));

}());