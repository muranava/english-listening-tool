define ('view/list', ['dom', 'event', 'controller', 'model'], function (dom, Event, Controller, Model) {
    function preloadFurther () {
        var div = this.parentNode,
            node,
            i = 3;
        while (i-- && (div = div.nextElementSibling)) {
            if (!div) { break; }
            node = div.children[0];
            if (!node) { i++; continue; }
            node.preload = 'auto';
        }
    }
    var ListView = {
        mainBlock: null,
        lastTitle: null,
        clear: function () {
            this.mainBlock.innerHTML = "";
            this.lastTitle = "";
        },
        addTitle: function (title) {
            dom('<h3>', this.mainBlock).innerHTML = title;
        },
        showSpoiler: function () {
            if (this.classList.contains('spoiled')) {
                return false;
            }
            this.innerHTML = Controller.placeMarks(this.title);
            this.title = '';
            this.classList.add('spoiled');
            return false;
        },
        addItem: function (item) {
            if (this.lastTitle !== item.title) {
                this.addTitle(this.lastTitle = item.title);
            }
            var div = dom('<div>');
                var audio = dom('<audio>', div);
                    audio.src = Model.getFullPath(item.fileName);
                    audio.controls = true;
                    audio.preload = 'none';
                    audio.onplay = preloadFurther;
                var a = dom('<a.spoiler>text</a>', div);
                    a.href = '#';
                    a.onclick = this.showSpoiler;
                    a.title = item.phrase;
            this.mainBlock.appendChild(div);
        }
    };
    Event.on('init', function () {
        this.mainBlock = dom('#listen');
        Event.on('search.clear', this.clear.bind(this));
        Event.on('search.item', this.addItem.bind(this));
    }.bind(ListView));
    return ListView;
});
