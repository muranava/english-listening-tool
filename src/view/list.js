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
        pool: [],
        clear: function () {
            var mb = this.mainBlock;
            mb.style.display = 'none';
            this.pool.push.apply(
                this.pool,
                [].map.call(mb.children, this.removeItem)
            );
            mb.style.display = '';
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
            var div, audio, a;
            if (this.pool.length) {
                div = this.pool.pop();
                audio = div.querySelector('audio');
                a = div.querySelector('span');
            } else {
                div = dom('<div>');
                audio = dom('<audio>', div);
                    audio.controls = true;
                    audio.preload = 'none';
                    audio.onplay = preloadFurther;
                a = dom('<span.spoiler>text</span>', div);
                    a.onclick = this.showSpoiler;
            }
            audio.src = Model.getFullPath(item.fileName);
            a.title = item.phrase;
            this.mainBlock.appendChild(div);
        }
    };
    Event.on('init', function () {
        var mb = this.mainBlock = dom('#listen');
        this.removeItem = mb.removeChild.bind(mb);
        mb.addEventListener('click', function (event) {
            var t = event.target;
            if (t.nodeName.toLowerCase() === 'mark') {
                t.innerHTML = t.getAttribute('data-text');
            }
        });
        Event.on('search.clear', this.clear.bind(this));
        Event.on('search.item', this.addItem.bind(this));
    }.bind(ListView));
    return ListView;
});
