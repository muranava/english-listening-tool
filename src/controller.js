define('controller', ['event', 'model'], function (Event, Model) {
    var Controller = {
        placeMarks: function (str, expandMarks) {
            return str.replace(Model.getSearchRe(), function () {
                var m = Array.prototype.slice.call(arguments, 0, -2);
                if (expandMarks) {
                    return m[1] + "<mark>" + m[2] + "</mark>" + m.slice(-1)[0];
                } else {
                    return (
                        m[1] + "<mark data-text='" + m[2].replace(/'/g, "&#39;") + "'>***</mark>" + m.slice(-1)[0]
                    );
                }
            });
        },
        saveHash: function (value) {
            location.replace(location.href.replace(/#.*$/, '') + '#' + value);
        },
        loadHash: function () {
            if (/^#.+/.test(location.hash)) {
                Event.fire('term.load', { term: location.hash.replace(/^#/, '') });
            }
        }
    };
    Event.on('load.finished', function () {
        Controller.loadHash();
    });
    Event.on('term.change', function (data) {
        Controller.saveHash(data.term);
        //Controller.search(data);
        Model.searchWord(data.term, data.wholeword);
    });
    Event.on('search', function () {
        Event.fire('search.items', Model.getSearchResults());
/*        var firstTrack = document.querySelector('audio');
        if (firstTrack) {
            firstTrack.preload = 'auto';
            firstTrack.onplay();
        }*/
    });
    return Controller;
});
