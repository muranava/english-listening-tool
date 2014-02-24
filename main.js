(function () {
    'use strict';
    function $(id) { return document.getElementById(id); }
    var View, Model, Controller;
    var cutCompressor = (function () {
        var i = 64, abc = [], abci = [];
        for (;i--;) abci[abc[i]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charCodeAt(i)] = i;
        function toBase64(n) {
            var a = [];
            while (n) { a.push(abc[n % base]); n = Math.floor(n / base); }
            return String.prototype.apply(null, a.reverse());
        }
        function fromBase64(s) {
            var n = 0, i;
            for (i = 0; i < s.length; i++) n = n * 64 + abci[s.charCodeAt(i)];
            return n;
        }
        function parseTime(m) { return ((m[0]*60 + m[1]) * 60 + m[2]) * 1000 + (+m[3]); }
        function toTime(t) { return new Date(t).toJSON().slice(12,-1).replace(/:/g,'.'); }
        return {
            deflate: function (cutChunk) {
                var prefix, out;
                cutChunk.forEach(function (cut) {
                    var m = cut.fileName.match(/^(\w+s\d{2}e\d{2})_1_(\d)\.(\d{2})\.(\d{2})\.(\d{3})-(\d)\.(\d{2})\.(\d{2})\.(\d{3})\.mp3$/);
                    if (!prefix) out.push(prefix = m[1]);
                    if (prefix != m[1]) throw new Error("Uncommon prefix");
                    var t1 = parseTime(m.slice(1, 5)),
                        t2 = parseTime(m.slice(5, 9)) - t1;
                    out.push(toBase64(t1) + '-' + toBase64(t2-t1) + ':' + cut.phrase);
                });
                return out.join("\t");
            },
            inflate: function (str) {
                var parts = str.split("\t"),
                    prefix = parts[0];
                return parts.slice(1).map(function (s) {
                    var m = s.match(/^([\w\/+]+)-([\w\/+]+):(.+)$/);
                    var t1 = fromBase64(m[1]),
                        t2 = fromBase64(m[2]);
                    return {
                        fileName: prefix + '_1_' + toTime(t1) + '-' + toTime(t2+t1) + '.mp3',
                        phrase: m[3],
                        transcription: ""
                    };
                });
            }
        };
    }());
    Controller = {
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
            View.showSearchAmount(mc.length, this.regexpSearch);
        },
        placeMarks: function (str) {
            return str.replace(this.re, function () {
                var m = Array.prototype.slice.call(arguments, 0, -2);
                return m[1] + "<mark>" + m[2] + "</mark>" + m.slice(-1)[0];
            });
        },
        search: function (event) {
            Controller.searchWord(View.kw.value, View.wholeword.checked);
        },
        saveHash: function (value) {
            location.replace(location.href.replace(/#.*$/, '') + '#' + value);
        },
        loadHash: function () {
            if (/^#.+/.test(location.hash)) {
                View.kw.value = location.hash.replace(/^#/, '');
                return true;
            }
        },
        getSeriesTitles: function () {
            return Object.keys(Model.series);
        }
    };
    View = {
        showProgress: function (percent) {
            var w, c;
            if (percent === 1) {
                this.kw.style.boxShadow = '';
                this.kw.disabled = false;
                this.kw.focus();
                if (Controller.loadHash()) {
                    Controller.search();
                }
                return;
            }
            w = Math.round(250 * percent);
            c = 192 + Math.round((238-192) * percent);
            this.kw.style.boxShadow = w + "px 0 0 0 rgb(" + [c,c,c] + ") inset";
        },
        showError: function (msg) {
            var error = document.createElement('div');
            error.className = 'error';
            error.innerHTML = msg;
            document.body.appendChild(error);
        },
        showTitle: function () {
            if (this.classList.contains('spoiled')) {
                return false;
            }
            this.innerHTML = Controller.placeMarks(this.title);
            this.title = '';
            this.classList.add('spoiled');
            return false;
        },
        showSearchAmount: function (n, isRegExp) {
            this.infoCount.innerHTML = 
                (n ? "<b>" + n + "</b> phrases found" : "Nothing found") +
                (isRegExp ? " *R" : "");
        },
        kw: null,
        slist: null,
        form: null,
        mainBlock: null,
        infoCount: null,
        wholeword: null,
        initFields: function () {
            this.slist = $('series_list');
            this.kw = $('keywords');
            this.form = $('form');
            this.mainBlock = $('listen');
            this.infoCount = document.getElementsByClassName('info')[0];
            this.wholeword = $('wholeword');
        },
        initEvents: function () {
            $('list').onclick = function () { View.form.classList.toggle('listExpanded'); };
            Controller.getSeriesTitles().forEach(function (title) {
                this.slist.insertAdjacentHTML('beforeend', '<div><label><input type="checkbox" name="' + title + '" /> ' + title + '</label></div>');
            }, this);
            View.form.onsubmit = searchAction;
            this.kw.onkeyup = this.kw.onchange = function (event) {
                View.wholeword.checked = this.value.indexOf(' ') === -1;
                Controller.saveHash(this.value);
                Controller.search(event);
            };
            View.wholeword.onclick = Controller.search;
        }
    };
    Model = {
        cuts: [],
        titles: [],
        titleSewers: {},
        sewerIndex: 0,
        ready: false,
        matchedCuts: [],
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
        load: function (data, name) {
            function processRecord(model, name, rec) {
                model.cuts.push({
                    fileName: rec[0],
                    phrase: rec[1],
                    transcription: rec[2],
                    title: name
                });
            }
            this.titleSewers[name] = data;
            while ((data = this.titleSewers[name = this.titles[this.sewerIndex]])) {
                data.forEach(processRecord.bind(null, this, name));
                this.sewerIndex++;
                View.showProgress(this.sewerIndex / this.titles.length);
            }
            if (this.sewerIndex > this.titles.length) {
                this.ready = true;
            }
        }
    };

    window.onload = function () {
        if (!window.Audio) {
            View.showError("Audio is not supported in your browser. Please, try in IE9 or any other modern browser.");
        }
        View.initFields();
        View.initEvents();
        var data = Model.series, name;
        function loadScript (name) {
            var script = document.createElement('script');
            script.type = "text/javascript";
            window[name] = function (data) {
                Model.load(data, name);
                window[name] = null;
            };
            script.src = "meta/" + name + ".csv.js";
            document.body.appendChild(script);
        }
        function processEpisode (name, ep) {
            var title = name + '_' + ep;
            Model.titles.push(title);
            loadScript(title);
        }
        for (name in data) {
            data[name].forEach(processEpisode.bind(null, name));
        }
    };

/*    var audio = document.createElement('audio');
    document.body.appendChild(audio);
    function playSound (path) {
        audio.oncanplaythrough = function () { this.play(); };
        audio.src = Model.getFullPath(path);
    }*/

    function preloadFurther (event) {
        var div = event.target.parentNode,
            node,
            i = 3;
        while (i-- && (div = div.nextElementSibling)) {
            if (!div) { break; }
            node = div.children[0];
            if (!node) { i++; continue; }
            node.preload = 'auto';
        }
    }
    function searchAction (event) {
        event.preventDefault();
        View.mainBlock.innerHTML = "";
        var title = "";
        Model.matchedCuts.forEach(function (idx) {
            var cut = Model.cuts[idx];
            if (title !== cut.title) {
                title = cut.title;
                var heading = document.createElement('h3');
                heading.innerHTML = cut.title;
                View.mainBlock.appendChild(heading);
            }
            var div = document.createElement('div');
                var audio = document.createElement('audio');
                    audio.src = Model.getFullPath(cut.fileName);
                    audio.controls = true;
                    audio.preload = 'none';
                    audio.onplay = preloadFurther;
                div.appendChild(audio);
                var a = document.createElement('a');
                    a.href = '#';
                    a.onclick = View.showTitle;
                    a.innerHTML = "text";
                    a.className = 'spoiler';
                    a.title = cut.phrase;
                div.appendChild(a);
            View.mainBlock.appendChild(div);
        });
        var firstTrack = document.querySelector('audio');
        firstTrack.preload = 'auto';
        firstTrack.onplay({ target: firstTrack });
    }
}());
