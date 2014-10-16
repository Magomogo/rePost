(function () {
    'use strict';

    var fs = require('fs'),
        repost = require('repost'),

        latestPostedDate = new Date(
            fs.existsSync('/tmp/rePost_latestPostedDate.txt') ?
                fs.readFileSync('/tmp/rePost_latestPostedDate.txt', {encoding: 'utf8'}) : '1970-01-01'
        );

    repost.src.googlePlus({
            googleUserId: undefined,
            googleAPIKey: undefined
        })
        .on('error', function (err) { console.error(err); })
        .pipe(repost.filter.publishedAfter(latestPostedDate))
        .pipe(repost.logger(process.stdout))
        .pipe(repost.dest.twitter({
            twitterConsumerKey: undefined,
            twitterConsumerSecret: undefined,
            twitterAccessToken: undefined,
            twitterAccessTokenSecret: undefined
        }))
        .on('error', function (err) { console.error(err); })
        .pipe(repost.dest.publishedDate('/tmp/rePost_latestPostedDate.txt'));

}());