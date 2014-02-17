(function () {
    'use strict';
    function $(id) { return document.getElementById(id); }
    var View, Model, Controller;
    if (!window.Audio) {
        View.showError("Audio is not supported in your browser. Please, try in IE9 or any other modern browser.");
    }
    Controller = {
        re: null,
        searchRegExp: function (word, whole) {
            word = word.replace(/./g, function (c) { return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4); });
            return whole ?
                new RegExp("(^| )(" + word + ")([ ,.:;?!]|$)", 'i') :
                new RegExp("()(" + word + ")()", 'i');
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
            View.showSearchAmount(mc.length);
        },
        search: function (event) {
            Controller.searchWord(View.kw.value, View.wholeword.checked);
        },
        getSeriesTitles: function () {
            return Object.keys(Model.series);
        }
    };
    View = {
        showProgress: function (percent) {
            var w, c;
            if (percent === 1) {
                this.kw.style.boxShadow = 'none';
            }
            w = Math.round(250 * percent);
            c = 192 + Math.round((238-192) * percent);
            this.kw.style.boxShadow = w + "px 0 0 0 rgb(" + [c,c,c] + ") inset";
        },
        showError: function (msg) {
            var error = document.createElemenet('div');
            error.className = 'error';
            error.innerHTML = msg;
            document.body.appendChild(error);
        },
        showTitle: function () {
            this.innerHTML = this.title.replace(Controller.re, "$1<mark>$2</mark>$3");
            this.title = '';
            this.onclick = null;
            this.classList.add('spoiled');
            return false;
        },
        showSearchAmount: function (n) {
            this.infoCount.innerHTML = n ? "<b>" + n + "</b> phrases found" : "";
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
            View.form.onsubmit = formSubmit;
            this.kw.onkeyup = this.kw.onchange = function (event) {
                View.wholeword.checked = this.value.indexOf(' ') === -1;
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
            var processRecord = function (rec) {
                this.cuts.push({
                    fileName: rec[0],
                    phrase: rec[1],
                    transcription: rec[2],
                    title: name
                });
            }.bind(this);
            this.titleSewers[name] = data;
            while ((data = this.titleSewers[this.titles[this.sewerIndex]])) {
                data.forEach(processRecord);
                this.sewerIndex++;
            }
            if (this.sewerIndex > this.titles.length) {
                this.ready = true;
            }
        }
    };

    function loadMeta (data, name) {
        Model.load(data, name);
        View.kw.disabled = false;
        View.kw.style.boxShadow = "";
        View.kw.focus();
    }

    window.onload = function () {
        View.initFields();
        View.initEvents();
        var data = Model.series, name;
        function loadScript (name) {
            var script = document.createElement('script');
            script.type = "text/javascript";
            window[name] = function (data) {
                loadMeta(data, name);
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

    function preloadFurther () {
        var div = this.parentNode,
            i = 3;
        while (i-- && (div = div.nextElementSibling)) {
            div.children[0].preload = 'auto';
        }
    }
    function formSubmit (event) {
        event.preventDefault();
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
        firstTrack.onplay();
    }
}());
