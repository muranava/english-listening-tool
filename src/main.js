define ('main', ['event'], function (Event) {
    if (document.readyState === 'complete') {
        Event.fire('init');
    } else {
        document.addEventListener('DOMContentRead', function () {
            Event.fire('init');
        });
    }
    if (!window.Audio) {
        Event.fire('error', { msg: "Audio is not supported in your browser. Please, try in IE9 or any other modern browser." });
    }
    return true;
});
require(['view/error', 'view/list', 'view/search', 'main']);
