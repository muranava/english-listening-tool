define ('view/search', ['dom', 'event'], function (dom, Event) {
    var SearchView = {
        showProgress: function (data) {
            var w, c, percent = data.percent;
            if (percent === 1) {
                this.kw.style.boxShadow = '';
                this.kw.focus();
                return;
            }
            w = Math.round(250 * percent);
            c = 192 + Math.round((238-192) * percent);
            this.kw.style.boxShadow = w + "px 0 0 0 rgb(" + [c,c,c] + ") inset";
        },
        getTerm: function () {
            return this.kw.value;
        },
        showSearchAmount: function (data) {
            this.infoCount.innerHTML = 
                (data.total ? "<b>" + data.total + "</b> phrases found" : "Nothing found") +
                (data.isRegExpSearch? " *R" : "");
        },
        kw: null,
        slist: null,
        form: null,
        infoCount: null,
        wholeword: null,
        initFields: function () {
            this.slist = dom('#series_list');
            this.kw = dom('#keywords');
            this.form = dom('#form');
            this.infoCount = dom('.info');
            this.wholeword = dom('#wholeword');
        },
        initEvents: function () {
            var me = this;
            var termChange = function () {
                Event.fire('term.change', {
                    term: me.kw.value,
                    wholeword: me.wholeword.checked
                });
            };
            dom('#list').onclick = function () { me.form.classList.toggle('listExpanded'); };
            dom('#all_spoilers').onclick = function () { Event.fire('spoiler.all'); };
            Event.on('series', function (data) {
                var label = dom('<label>', dom('<div.series_list_item>', me.slist));
                var input = dom('<input>', label);
                input.type = 'checkbox';
                input.name = data.title;
                label.appendChild(document.createTextNode(data.title));
            });
            this.form.onsubmit = function (event) {
                event.preventDefault();
                Event.fire('search');
            };
            this.kw.onkeyup = this.kw.onchange = function (event) {
                me.wholeword.checked = this.value.indexOf(' ') === -1;
                termChange();
            };
            this.wholeword.onclick = termChange;
            Event.on('term.load', function (data) {
                SearchView.kw.value = data.term;
                termChange();
            });
        }
    };
    (function () {
        Event.on('load.progress', this.showProgress.bind(this));
        Event.on('search.count', this.showSearchAmount.bind(this));
        Event.on('init', function () {
            this.initFields();
            this.initEvents();
        }.bind(this));
    }.call(SearchView));
    return SearchView;
});
