define('controller', ['event', 'model'], function (Event, Model) {
    var Controller = {
        re: null,
        searchRegExp: function (word, whole) {
            var regexpSearch = !/[.?]$/.test(word) && !/^\w+$/i.test(word);
            try {
                new RegExp(word);
            } catch (e) {
                regexpSearch = false;
            }
            if (!regexpSearch) {
                word = word.replace(/./g, function (c) { return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4); });
            } else {
                word = word.replace(/\\(\d+)/g, function (m, d) { return "\\" + (+d+2); });
            }
            this.regexpSearch = regexpSearch;
            return (whole && !regexpSearch) ?
                new RegExp("(^| )(" + word + ")([ ,.:;?!]|$)", 'ig') :
                new RegExp("()(" + word + ")()", 'ig');
        },
        searchWord: function (word, whole) {
            var mc = Model.matchedCuts;
            mc.length = 0;
            if (word) {
                this.re = this.searchRegExp(word, whole);
                Model.cuts.forEach(function (cut, i) {
                    if (this.re.test(cut.phrase)) { mc.push(i); }
                }, this);
            }
            Event.fire('search.count', {
                total: mc.length,
                isRegExpSearch: this.regexpSearch
            });
        },
        placeMarks: function (str) {
            return str.replace(this.re, function () {
                var m = Array.prototype.slice.call(arguments, 0, -2);
                return m[1] + "<mark>" + m[2] + "</mark>" + m.slice(-1)[0];
            });
        },
        search: function (data) {
            this.searchWord(data.term, data.wholeword);
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
