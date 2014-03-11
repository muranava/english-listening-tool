define ('loader', ['event', 'q'], function (Event, Q) {
    return function loadScript (name, ep) {
        return Q.promise(function(resolve, reject) {
            var title = name + '_' + ep,
                script = document.createElement('script');
            script.type = "text/javascript";
            window[title] = function (data) {
                window[title] = null;
//                    document.body.removeChild(script);
                data.title = title;
                resolve(data);
            };
            script.src = "meta/" + title + ".csv.js";
            script.onerror = function () {
                reject(Error("script error"));
            };
            document.body.appendChild(script);
        });
    };
});
