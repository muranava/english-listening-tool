define('controller', ['event', 'model'], function (Event, Model) {
    var Controller = {
        placeMarks: function (str) {
            return str.replace(Model.re, function () {
                var m = Array.prototype.slice.call(arguments, 0, -2);
                return (
                    m[1] + "<mark data-text='" + m[2].replace(/'/g, "&#39;") + "'>***</mark>" + m.slice(-1)[0]
                );
            });
        },
        search: function (data) {
            Model.searchWord(data.term, data.wholeword);
        },
        saveHash: function (value) {
            location.replace(location.href.replace(/#.*$/, '') + '#' + value);
        },
        loadHash: function () {
            if (/^#.+/.test(location.hash)) {
                Event.fire('term.load', { term: location.hash.replace(/^#/, '') });
            }
        },
        getSeriesTitles: function () {
            return Object.keys(Model.series);
        }
    };
    Event.on('load.finished', function () {
        Controller.getSeriesTitles().forEach(function (title) {
            Event.fire('series', { title: title });
        });
        Controller.loadHash();
    });
    Event.on('term.change', function (data) {
        Controller.saveHash(data.term);
        Controller.search(data);
    });
    Event.on('search', function () {
        Event.fire('search.clear');
        Model.matchedCuts.forEach(function (idx) {
            Event.fire('search.item', Model.cuts[idx]);
        });
        var firstTrack = document.querySelector('audio');
        if (firstTrack) {
            firstTrack.preload = 'auto';
            firstTrack.onplay();
        }
    });
    return Controller;
});
