define ('loader', ['event', 'model'], function (Event, Model) {
    Event.on('init', function () {
        var data = Model.series,
            name;
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
    });
    return true;
});
