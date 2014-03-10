define('model', ['event'], function (Event) {
    var titleSewers = {},
        sewerIndex = 0;
    return {
        cuts: [],
        titles: [],
        matchedCuts: [],
        re: null,
        IPAsearch: false,
        series: {
            endeavour: ['1_1', '1_2', '1_3', '1_4'],
            sherlock: ['1_1', '1_2', '1_3', '2_1', '2_2', '2_3', '3_1'],
            numbers: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_7', '1_8'],
            breakingbad: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_6', '1_7'],
            person: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_6', '1_7', '1_8', '1_9']
        },
        getFullPath: function (path) {
            return "media/" + path.match(/^\w+_s\d{2}e\d{2}/)[0] + "/" + path;
        },
        searchRegExp: function (word, whole) {
            var regexpSearch = !/[.?]$/.test(word) && !/^\w+$/i.test(word);
            try {
                new RegExp(word);
            } catch (e) {
                regexpSearch = false;
            }
            this.IPAsearch = /[\u0250-\u02AF]/.test(word);
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
            var mc = this.matchedCuts;
            mc.length = 0;
            var fieldName = this.IPAsearch ? 'transcription' : 'phrase';
            if (word) {
                this.re = this.searchRegExp(word, whole);
                this.cuts.forEach(function (cut, i) {
                    if (this.re.test(cut[fieldName])) { mc.push(i); }
                }, this);
            }
            Event.fire('search.count', {
                total: mc.length,
                isRegExpSearch: this.regexpSearch
            });
        },
        add: function (data, name) {
            function processRecord (name, rec) {
                this.cuts.push({
                    fileName: rec[0],
                    phrase: rec[1],
                    transcription: rec[2],
                    title: name
                });
            }
            titleSewers[name] = data;
            while ((data = titleSewers[name = this.titles[sewerIndex]])) {
                data.forEach(processRecord.bind(this, name));
                sewerIndex++;
                var percent = sewerIndex / this.titles.length;
                Event.fire('load.progress', { percent: percent });
                if (percent === 1) {
                    Event.fire('load.finished');
                }
            }
        }
    };
});
