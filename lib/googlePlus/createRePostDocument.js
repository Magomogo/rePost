(function () {
    'use strict';

    var htmlToText = require('html-to-text'),
        config = {
            charactersReservedPerMedia: 23,
            shortUrlLength: 22
        };

    function tweetLimit(embedVideo, embedImage, linkGplus) {
        return 140 - (embedVideo ? config.shortUrlLength + 1 : 0) -
        (embedImage ? config.charactersReservedPerMedia + 1 : 0) -
        (linkGplus ? config.shortUrlLength + 2 : 0); // http[s] takes one letter more
    }

    module.exports = function (item) {
        var embedVideo = item.object.attachments && item.object.attachments[0].objectType === 'video' ?
                item.object.attachments[0].url : undefined,

            embedImage = item.object.attachments && item.object.attachments[0].fullImage ?
                item.object.attachments[0].fullImage.url : undefined,

            link = item.object.attachments &&
                (['video', 'photo'].indexOf(item.object.attachments[0].objectType) < 0),

            text = htmlToText.fromString(item.object.content.replace(/<[^>]*>?/g, ''), {wordwrap: 140}),

            linkUrl = item.object.attachments && item.object.attachments[0].objectType === 'article' ?
                item.object.attachments[0].url : item.url;

        if (!text.length) {
            // nothing to say
            return undefined;
        }

        if (text.length > tweetLimit(embedVideo, embedImage, link)) {
            link = true;
            linkUrl = item.url;
        }

        var tweet = text.substr(0, tweetLimit(embedVideo, embedImage, link)) +
            (embedVideo ? ' ' + embedVideo : '') + (link ? ' ' + linkUrl : '');

        return {
            title: item.title,
            contentLessThan140Chars: tweet,
            image: embedImage,
            published: new Date(item.published),
            rePublished: undefined
        };
    };
}());