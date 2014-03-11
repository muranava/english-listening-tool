define(function () {
    var Event = require('event'),
        Loader = require('loader'),
        Searcher = require('searcher'),
        Q = require('q'),
        Cut = require('cut');
    var sr = [];
    var matcher = Searcher.match.bind(Searcher);
    var model = {
        cuts: [],
        titles: [],
        series: {
            endeavour: ['1_1', '1_2', '1_3', '1_4'],
            sherlock: ['1_1', '1_2', '1_3', '2_1', '2_2', '2_3', '3_1'],
            numbers: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_7', '1_8'],
            breakingbad: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_6', '1_7'],
            person: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_6', '1_7', '1_8', '1_9']
        },
        getSearchRe: function () {
            return Searcher.re;
        },
        searchWord: function (word, whole) {
            if (word) {
                Searcher.adapt(word, whole);
                sr = this.cuts.filter(matcher);
            } else {
                sr = [];
            }
            Event.fire('search.count', {
                total: sr.length,
                differentResults: Searcher.areDifferent,
                isRegExpSearch: Searcher.regexpSearch
            });
        },
        getSearchResults: function () {
            return sr;
        },
        add: function (series) {
            this.cuts.push.apply(this.cuts, series.map(function (rec) {
                return new Cut(rec, series.title);
            }));
        }
    };
    var name,
        counter = 0,
        series,
        episodes,
        seriesLoad = [],
        progress = function (data) {
            var percent = ++counter / model.total;
            Event.fire('load.progress', { percent: percent });
            return data;
        },
        data = model.series;
    model.total = 0;
    for (name in data) model.total += data[name].length;
    for (name in data) {
        episodes = data[name].map(function (ep) {
            return Loader(name, ep).then(progress, progress);
        });
        series = Q.all(episodes).then(function (title, arr) {
            arr.forEach(model.add.bind(model));
            Event.fire('series', { title: title });
        }.bind(null, name));
        seriesLoad.push(series);
    }
    Q.all(seriesLoad).then(function () {
        Event.fire('load.finished');
    });
    return model;
});
