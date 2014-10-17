describe('createRePostDocument', function () {
    'use strict';

    var fs = require('fs'),
        assert = require('assert'),
        repostDocument = require(__dirname + '/../../lib/googlePlus/createRePostDocument.js'),

        publicActivity = function (num) {
            return JSON.parse(
                fs.readFileSync(__dirname + '/data/publicActivitiesApiResponse.json', {encoding: 'utf-8'})
            ).items[num];
        };

    it('cuts simple textual post giving reference to the original', function () {
        var doc = repostDocument(publicActivity(5));
        assert.equal(
            '#яндекс первым отметил открывшийся в Новосибирске Бугринский мост ' +
            'на своих картах. Конечно не считая #osm, где всегд ' +
            'https://plus.google.com/113769456294897662939/posts/46efw4nK65a',
            doc.contentLessThan140Chars
        );
        assert.equal(doc.image, undefined);
        assert.deepEqual(doc.published, new Date('2014-10-09T01:47:46.357Z'));
    });

    it('gives link to posted video', function () {
        var doc = repostDocument(publicActivity(1));
        assert.equal(
            'Как же жить-то хорошо и весело! http://www.youtube.com/watch?v=szOhGOHnTRE',
            doc.contentLessThan140Chars
        );
    });

    it('will not link post when it wits into 140 chars', function () {
        var doc = repostDocument(publicActivity(8));
        assert.equal(
            'Я познал секрет популярности и теперь понимаю о чем будет мой инстаграм! ' +
            'Буду въезжать в топ на своем коте! #коты',
            doc.contentLessThan140Chars
        );
    });

    it('reads image from post with image', function () {
        var doc = repostDocument(publicActivity(9));
        assert.equal(
            'It bends too!',
            doc.contentLessThan140Chars
        );
        assert.equal(
            'https://lh3.googleusercontent.com/-U47uAKfzw-o/VDI9LulC9AI/AAAAAAAArWE/MA5aOwSyeD0' +
            '/w1080-h720/%25D0%25A4%25D0%25BE%25D1%2582%25D0%25BE%25D0%25B3%25D1%2580%25D0%25B0' +
            '%25D1%2584%25D0%25B8%25D1%258F%2B06.10.14%2B%25D0%25B2%2B13.54.jpg',
            doc.image
        );
    });

    it('uses author`s words dealing with reposts', function () {
        var doc = repostDocument(publicActivity(0));
        assert.equal(
            'А вот тут предлагают велосипедистам ездить по середине дороги!',
            doc.title
        );
        assert.equal(
            'А вот тут предлагают велосипедистам ездить по середине дороги!',
            doc.contentLessThan140Chars
        );
        assert.equal(
            'https://lh4.googleusercontent.com/-S4-8kLMLdc8/VD7ubhWDpxI/' +
            'AAAAAAAAWus/lLNgmiLxdlA/w600-h519/IMG_1866.JPG',
            doc.image
        );
    });
});