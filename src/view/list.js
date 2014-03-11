define ('view/list', ['dom', 'event', 'controller'], function (dom, Event, Controller) {
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
    var player = dom("#player"),
        lastPlayed = null;
    player.oncanplaythrough = player.play;
    var ListView = {
        mainBlock: null,
        lastTitle: "",
        expandMarks: false,
        pool: [],
        items: [],
        clear: function () {
            var mb = this.mainBlock,
                i = mb.children.length, j,
                item;
            mb.style.display = 'none';
            if (lastPlayed) {
                lastPlayed.classList.remove('itemActive');
            }
            while (i--) {
                item = mb.children[i];
                mb.removeChild(item);
                if (item.classList.contains('block')) {
                    j = item.children.length;
                    while (j--) {
                        this.pool.push(item.removeChild(item.children[j]));
                    }
                }
            }
            mb.style.display = '';
            this.lastTitle = "";
        },
        showSpoiler: function () {
            if (this.classList.contains('spoiled')) {
                return false;
            }
            this.innerHTML = Controller.placeMarks(this.title, ListView.expandMarks);
            this.title = "";
            this.classList.add('spoiled');
            return false;
        },
        playAudio: function () {
            this.classList.add('itemPlayed');
            if (lastPlayed) {
                lastPlayed.classList.remove('itemActive');
            }
            lastPlayed = this.parentNode;
            lastPlayed.classList.add('itemActive');
            player.src = lastPlayed.dataset.src;
            player.load();
            setTimeout(function(){ player.pause(); }, 1);
        },
        addTitle: function (title) {
            this.addGroup();
            var heading = dom('<h3>', this.mainBlock);
            heading.innerHTML = title;
            heading.onclick = function () {
                this.classList.toggle('collapsed');
            };
        },
        addGroup: function () {
            if (!this.items.length) return;
            var div = dom("<div.block>", this.mainBlock);
            var doc = document.createDocumentFragment();
            this.items.forEach(function (node) {
                doc.appendChild(node);
            });
            div.appendChild(doc);
            this.items = [];
        },
        addItems: function (items) {
            this.clear();
            this.items = [];
            items.forEach(this.addItem.bind(this));
            this.addGroup();
        },
        addItem: function (item) {
            if (this.lastTitle !== item.title) {
                this.addTitle(this.lastTitle = item.title);
            }
            var div, input, a;
            if (this.pool.length) {
                div = this.pool.pop();
                //audio = div.querySelector('audio');
                a = div.querySelector('span');
                if (a.classList.contains('spoiled')) {
                    a.classList.remove('spoiled');
                    a.innerHTML = "text";
                }
            } else {
                div = dom('<div.item>');
                input = dom('<button>Play</button>', div);
                    input.onclick = this.playAudio;
                a = dom('<span.spoiler>text</span>', div);
                    a.onclick = this.showSpoiler;
            }
            div.dataset.src = item.getFullPath();
            a.title = item.phrase;
            this.items.push(div);
        }
    };
    Event.on('init', function () {
        var mb = this.mainBlock = dom('#listen');
        this.removeItem = mb.removeChild.bind(mb);
        mb.addEventListener('click', function (event) {
            var t = event.target;
            if (t.nodeName.toLowerCase() === 'mark') {
                if (t.dataset.text) {
                    t.innerHTML = t.dataset.text;
                }
            }
        });
        Event.on('search.items', this.addItems.bind(this));
        Event.on('search.count', function (data) {
            ListView.expandMarks = !data.differentResults;
        });
    }.bind(ListView));
    return ListView;
});
