define ('main', ['event', 'controller'], function (Event, Controller) {
    var c = Controller; // prevent minifier from removing argument
    window.onload = function () {
        Event.fire('init');
    };
    if (!window.Audio) {
        Event.fire('error', { msg: "Audio is not supported in your browser. Please, try in IE9 or any other modern browser." });
    }
    return true;
});
